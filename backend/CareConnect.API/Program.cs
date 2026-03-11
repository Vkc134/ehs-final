using CareConnect.API.Middleware;
using CareConnect.Core.Common;
using CareConnect.Core.Interfaces;
using CareConnect.Infrastructure.Data;
using CareConnect.Infrastructure.Repositories;
using CareConnect.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.FileProviders;
using System.Text;
using CareConnect.Core.Entities;

var builder = WebApplication.CreateBuilder(args);

// ── Typed Configuration (IOptions pattern) ──────────────────────────────────
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.Configure<ICD11Settings>(builder.Configuration.GetSection("ICD11"));

// ── Controllers ─────────────────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DictionaryKeyPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    })
    .ConfigureApiBehaviorOptions(options =>
    {
        // Return ApiResponse on model validation failure
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            var response = CareConnect.Core.Common.ApiResponse.Fail("Validation failed.", errors);
            return new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(response);
        };
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "CareConnect API", Version = "v1" });
    // Enable JWT in Swagger UI
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter: Bearer {token}",
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ── Database ─────────────────────────────────────────────────────────────────
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (connectionString != null && connectionString.Contains("careconnect.db"))
{
    // Use an absolute path for Azure persistence
    // On Azure App Service Linux, /home is persistent
    var dbBaseDir = Environment.GetEnvironmentVariable("HOME") ?? Directory.GetCurrentDirectory();
    var dbPath = Path.GetFullPath(Path.Combine(dbBaseDir, "careconnect.db"));
    connectionString = $"Data Source={dbPath}";
    // Optimization for SQLite concurrency on Azure
    connectionString += ";Cache=Shared"; 
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(
        connectionString,
        b => b.MigrationsAssembly("CareConnect.API")));

// ── Authentication ────────────────────────────────────────────────────────────
var jwtSection = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.ASCII.GetBytes(jwtSection["SecretKey"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidIssuer = jwtSection["Issuer"],
        ValidAudience = jwtSection["Audience"]
    };
});

// ── Dependency Injection ──────────────────────────────────────────────────────
// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IICD11Service, ICD11Service>();

// Repository + Unit of Work
builder.Services.AddScoped<IPatientRepository, PatientRepository>();
builder.Services.AddScoped<IVisitRepository, VisitRepository>();
builder.Services.AddScoped<IPrescriptionRepository, PrescriptionRepository>();
builder.Services.AddScoped<IVitalsRepository, VitalsRepository>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Infrastructure
builder.Services.AddHttpClient();
builder.Services.AddMemoryCache();

// ── CORS ──────────────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy
            .SetIsOriginAllowed(_ => true) // Allow any origin but return it explicitly (compatible with credentials)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

// ── Build ─────────────────────────────────────────────────────────────────────
var app = builder.Build();

// ── Middleware Pipeline ───────────────────────────────────────────────────────
app.UseMiddleware<ExceptionMiddleware>(); // Global exception handler — must be first

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReactApp");

// 🔥 VERY IMPORTANT ORDER for SPA and static files

// 1️⃣ Serve React static files from wwwroot
app.UseDefaultFiles();
app.UseStaticFiles();

// 2️⃣ Ensure uploads folder exists
var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
if (!Directory.Exists(uploadsPath))
    Directory.CreateDirectory(uploadsPath);

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

// 3️⃣ Routing + Auth
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

// 4️⃣ Map Controllers
app.MapControllers();

// 5️⃣ React Fallback (for SPA routing)
app.MapFallbackToFile("index.html");

// ── Database Init ─────────────────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    context.Database.EnsureCreated(); // Use EnsureCreated for simple SQLite setups
    
    // Enable WAL mode for better concurrency in SQLite (Prevents "Database is locked" on Azure)
    try {
        var connection = context.Database.GetDbConnection();
        connection.Open();
        using var command = connection.CreateCommand();
        command.CommandText = "PRAGMA journal_mode=WAL;";
        command.ExecuteNonQuery();
    } catch { /* Ignore if fails */ }

    // ── Robust Seeding (Ensures data exists even if DB was already created) ──
    if (!context.Drugs.Any())
    {
        try 
        {
            var inventoryPath = Path.Combine(Directory.GetCurrentDirectory(), "current_inventory_6_1.csv");
            if (!File.Exists(inventoryPath))
            {
                inventoryPath = Path.Combine(Directory.GetParent(Directory.GetCurrentDirectory())?.FullName ?? "", "current_inventory_6_1.csv");
            }

            if (File.Exists(inventoryPath))
            {
                var lines = File.ReadAllLines(inventoryPath);
                var drugs = new List<Drug>();
                // Skip header: "Med Name","Invoice No.","Batch","Pack(Price)","Pack(MRP)","Units(Per Pack)","Units(Price)","Units in Stock","Expiry","%(Discount)","%(GST)"
                foreach (var line in lines.Skip(1))
                {
                    if (string.IsNullOrWhiteSpace(line)) continue;
                    
                    // Simple CSV parse for quoted values
                    var parts = line.Split("\",\"");
                    if (parts.Length > 0)
                    {
                        var name = parts[0].Trim('"');
                        // Use first drug occurrence to avoid duplicates in search
                        if (!drugs.Any(d => d.Name == name))
                        {
                            drugs.Add(new Drug { Name = name });
                        }
                    }
                }

                if (drugs.Any())
                {
                    context.Drugs.AddRange(drugs);
                    context.SaveChanges();
                    Console.WriteLine($"Successfully seeded {drugs.Count} drugs from inventory CSV.");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error seeding Drugs from CSV: {ex.Message}");
        }
    }

    if (!context.ICD11Codes.Any())
    {
        try 
        {
            var csvPath = Path.Combine(Directory.GetCurrentDirectory(), "diagnoses.csv");
            if (!File.Exists(csvPath)) 
            {
                // Try parent directory fallback (for different deployment structures)
                csvPath = Path.Combine(Directory.GetParent(Directory.GetCurrentDirectory())?.FullName ?? "", "diagnoses.csv");
            }

            if (File.Exists(csvPath))
            {
                var lines = File.ReadAllLines(csvPath);
                var codes = new List<ICD11Code>();
                foreach (var line in lines.Skip(1))
                {
                    if (string.IsNullOrWhiteSpace(line)) continue;
                    var firstComma = line.IndexOf(',');
                    if (firstComma > 0)
                    {
                        var code = line.Substring(0, firstComma).Trim();
                        var name = line.Substring(firstComma + 1).Trim().Trim('"');
                        codes.Add(new ICD11Code { Code = code, Description = name });
                    }
                }
                
                if (codes.Any())
                {
                    context.ICD11Codes.AddRange(codes);
                    context.SaveChanges();
                    Console.WriteLine($"Successfully seeded {codes.Count} ICD-11 codes from CSV.");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error seeding ICD-11 codes: {ex.Message}");
        }
    }
}

app.Run();
