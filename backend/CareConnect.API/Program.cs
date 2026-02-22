using CareConnect.Core.Interfaces;
using CareConnect.Infrastructure.Data;
using CareConnect.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.FileProviders;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// -----------------------------
// Add Services
// -----------------------------

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DictionaryKeyPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// SQLite DB
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        b => b.MigrationsAssembly("CareConnect.API")
    ));

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"]!);

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
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"]
    };
});

// Dependency Injection
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IICD11Service, ICD11Service>();
builder.Services.AddHttpClient();
builder.Services.AddMemoryCache();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

var app = builder.Build();

// -----------------------------
// Middleware Pipeline
// -----------------------------

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Enable CORS
app.UseCors("AllowReactApp");

// 🔥 VERY IMPORTANT ORDER

// 1️⃣ Serve React static files from wwwroot
app.UseDefaultFiles();
app.UseStaticFiles();

// 2️⃣ Ensure uploads folder exists
var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");

if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

// Serve uploads folder
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

// -----------------------------
// Database Initialization
// -----------------------------
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    context.Database.EnsureCreated();
}

app.Run();
