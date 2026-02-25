using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Configuration;

namespace CareConnect.Infrastructure.Services
{
    public interface IICD11Service
    {
        Task<List<ICD11SearchResult>> Search(string query);
    }

    public class ICD11SearchResult
    {
        public string Code { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string LinearizationUri { get; set; } = string.Empty;
    }

    public class ICD11Service : IICD11Service
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly IMemoryCache _cache;
        private const string TokenCacheKey = "ICD11_AccessToken";

        public ICD11Service(HttpClient httpClient, IConfiguration configuration, IMemoryCache cache)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _cache = cache;
        }

        private async Task<string> GetAccessTokenAsync()
        {
            if (_cache.TryGetValue(TokenCacheKey, out string cachedToken))
            {
                return cachedToken;
            }

            var clientId = _configuration["ICD11:ClientId"];
            var clientSecret = _configuration["ICD11:ClientSecret"];
            var tokenEndpoint = "https://icdaccessmanagement.who.int/connect/token";

            if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
            {
                throw new Exception("ICD11 ClientId or ClientSecret is missing in configuration.");
            }

            var request = new HttpRequestMessage(HttpMethod.Post, tokenEndpoint);
            var distinctId = $"{clientId}:{clientSecret}";
            var base64Credentials = Convert.ToBase64String(System.Text.Encoding.ASCII.GetBytes(distinctId));
            
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", base64Credentials);

            var content = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("grant_type", "client_credentials"),
                new KeyValuePair<string, string>("scope", "icdapi_access")
            });

            request.Content = content;

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            var tokenResponse = JsonSerializer.Deserialize<TokenResponse>(json);

            // Cache token for slightly less than its expiry time (usually 3600s)
            var expiry = TimeSpan.FromSeconds(tokenResponse.ExpiresIn - 60);
            _cache.Set(TokenCacheKey, tokenResponse.AccessToken, expiry);

            return tokenResponse.AccessToken;
        }

        public async Task<List<ICD11SearchResult>> Search(string query)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            var token = await GetAccessTokenAsync();
            sw.Stop();
            Console.WriteLine($"[PERF] Token Retrieval: {sw.ElapsedMilliseconds}ms");

            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            _httpClient.DefaultRequestHeaders.AcceptLanguage.Add(new StringWithQualityHeaderValue("en"));
            _httpClient.DefaultRequestHeaders.Add("API-Version", "v2");


            // search endpoint
            // search endpoint - using MMS Linearization for codes
            var url = $"https://id.who.int/icd/release/11/2024-01/mms/search?q={Uri.EscapeDataString(query)}&include=precoord&replacements=true";
            
            sw.Restart();
            var response = await _httpClient.GetAsync(url);
            sw.Stop();
            Console.WriteLine($"[PERF] WHO API Search: {sw.ElapsedMilliseconds}ms");
            
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            
            // Parse robustly
            // The API returns a structure like { destinationEntities: [ ... ] }
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;
            
            var results = new List<ICD11SearchResult>();

            if (root.TryGetProperty("destinationEntities", out var entities))
            {
                foreach (var entity in entities.EnumerateArray())
                {
                    // "theCode" is sometimes null for chapters/blocks, we might prefer "title"
                    var code = entity.TryGetProperty("theCode", out var c) ? c.GetString() : "";
                    var title = entity.TryGetProperty("title", out var t) ? t.GetString() : "";
                    var linearizationUri = entity.TryGetProperty("linearizationUri", out var l) ? l.GetString() : "";

                    // Strip HTML tags from title (e.g. <em class='found'>Cholera</em>)
                    if (!string.IsNullOrEmpty(title))
                    {
                        title = System.Text.RegularExpressions.Regex.Replace(title, "<.*?>", string.Empty);
                    }

                    if (!string.IsNullOrEmpty(code) && !string.IsNullOrEmpty(title))
                    {
                        results.Add(new ICD11SearchResult
                        {
                            Code = code,
                            Title = title,
                            LinearizationUri = linearizationUri
                        });
                    }
                }
            }

            return results;
        }

        private class TokenResponse
        {
            [JsonPropertyName("access_token")]
            public string AccessToken { get; set; }
            
            [JsonPropertyName("expires_in")]
            public int ExpiresIn { get; set; }
            
            [JsonPropertyName("token_type")]
            public string TokenType { get; set; }
        }
    }
}
