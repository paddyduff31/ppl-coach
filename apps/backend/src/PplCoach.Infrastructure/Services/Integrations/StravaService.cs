using Microsoft.Extensions.Logging;
using PplCoach.Domain.Entities;
using System.Text.Json;

namespace PplCoach.Infrastructure.Services.Integrations;

public class StravaService(HttpClient httpClient, ILogger<StravaService> logger)
{
    public async Task<StravaUserProfile?> GetUserProfileAsync(string accessToken)
    {
        try
        {
            httpClient.DefaultRequestHeaders.Authorization = new("Bearer", accessToken);

            var response = await httpClient.GetAsync("https://www.strava.com/api/v3/athlete");
            if (!response.IsSuccessStatusCode)
                return null;

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<JsonElement>(json);

            return new StravaUserProfile
            {
                Id = data.GetProperty("id").GetInt64(),
                Username = data.TryGetProperty("username", out var username) ? username.GetString() : null,
                FirstName = data.TryGetProperty("firstname", out var firstName) ? firstName.GetString() : null,
                LastName = data.TryGetProperty("lastname", out var lastName) ? lastName.GetString() : null,
                City = data.TryGetProperty("city", out var city) ? city.GetString() : null,
                State = data.TryGetProperty("state", out var state) ? state.GetString() : null,
                Country = data.TryGetProperty("country", out var country) ? country.GetString() : null,
                Sex = data.TryGetProperty("sex", out var sex) ? sex.GetString() : null,
                Weight = data.TryGetProperty("weight", out var weight) ? weight.GetDecimal() : null
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to get Strava user profile");
            return null;
        }
    }

    public async Task<List<StravaActivity>> GetActivitiesAsync(string accessToken, DateTime? after = null, int perPage = 30, int page = 1)
    {
        try
        {
            httpClient.DefaultRequestHeaders.Authorization = new("Bearer", accessToken);

            var queryParams = new List<string>
            {
                $"per_page={perPage}",
                $"page={page}"
            };

            if (after.HasValue)
                queryParams.Add($"after={new DateTimeOffset(after.Value).ToUnixTimeSeconds()}");

            var queryString = string.Join("&", queryParams);
            var response = await httpClient.GetAsync($"https://www.strava.com/api/v3/athlete/activities?{queryString}");

            if (!response.IsSuccessStatusCode)
                return new List<StravaActivity>();

            var json = await response.Content.ReadAsStringAsync();
            var activities = JsonSerializer.Deserialize<JsonElement[]>(json) ?? Array.Empty<JsonElement>();

            return activities.Select(ParseActivity).Where(a => a != null).Cast<StravaActivity>().ToList();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to get Strava activities");
            return new List<StravaActivity>();
        }
    }

    public async Task<StravaActivity?> GetActivityAsync(string accessToken, long activityId)
    {
        try
        {
            httpClient.DefaultRequestHeaders.Authorization = new("Bearer", accessToken);

            var response = await httpClient.GetAsync($"https://www.strava.com/api/v3/activities/{activityId}");
            if (!response.IsSuccessStatusCode)
                return null;

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<JsonElement>(json);

            return ParseActivity(data);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to get Strava activity {ActivityId}", activityId);
            return null;
        }
    }

    private StravaActivity? ParseActivity(JsonElement data)
    {
        try
        {
            return new StravaActivity
            {
                Id = data.GetProperty("id").GetInt64(),
                Name = data.GetProperty("name").GetString() ?? "",
                Description = data.TryGetProperty("description", out var desc) ? desc.GetString() : null,
                Type = data.GetProperty("type").GetString() ?? "",
                SportType = data.TryGetProperty("sport_type", out var sportType) ? sportType.GetString() : null,
                StartDate = data.GetProperty("start_date").GetDateTime(),
                StartDateLocal = data.GetProperty("start_date_local").GetDateTime(),
                Distance = data.TryGetProperty("distance", out var distance) ? distance.GetDecimal() : null,
                MovingTime = data.TryGetProperty("moving_time", out var movingTime) ? movingTime.GetInt32() : null,
                ElapsedTime = data.TryGetProperty("elapsed_time", out var elapsedTime) ? elapsedTime.GetInt32() : null,
                TotalElevationGain = data.TryGetProperty("total_elevation_gain", out var elevation) ? elevation.GetDecimal() : null,
                Calories = data.TryGetProperty("calories", out var calories) ? calories.GetDecimal() : null,
                AverageHeartrate = data.TryGetProperty("average_heartrate", out var avgHr) ? avgHr.GetDecimal() : null,
                MaxHeartrate = data.TryGetProperty("max_heartrate", out var maxHr) ? maxHr.GetDecimal() : null,
                AverageSpeed = data.TryGetProperty("average_speed", out var avgSpeed) ? avgSpeed.GetDecimal() : null,
                MaxSpeed = data.TryGetProperty("max_speed", out var maxSpeed) ? maxSpeed.GetDecimal() : null
            };
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to parse Strava activity");
            return null;
        }
    }
}

public class StravaUserProfile
{
    public long Id { get; set; }
    public string? Username { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? Sex { get; set; }
    public decimal? Weight { get; set; }
}

public class StravaActivity
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? SportType { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime StartDateLocal { get; set; }
    public decimal? Distance { get; set; }
    public int? MovingTime { get; set; }
    public int? ElapsedTime { get; set; }
    public decimal? TotalElevationGain { get; set; }
    public decimal? Calories { get; set; }
    public decimal? AverageHeartrate { get; set; }
    public decimal? MaxHeartrate { get; set; }
    public decimal? AverageSpeed { get; set; }
    public decimal? MaxSpeed { get; set; }
}
