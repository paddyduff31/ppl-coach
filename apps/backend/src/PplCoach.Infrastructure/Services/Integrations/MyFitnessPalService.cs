using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace PplCoach.Infrastructure.Services.Integrations;

public class MyFitnessPalService(HttpClient httpClient, ILogger<MyFitnessPalService> logger)
{
    public async Task<MyFitnessPalUserProfile?> GetUserProfileAsync(string accessToken)
    {
        try
        {
            httpClient.DefaultRequestHeaders.Authorization = new("Bearer", accessToken);

            var response = await httpClient.GetAsync("https://api.myfitnesspal.com/v2/profile");
            if (!response.IsSuccessStatusCode)
                return null;

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<JsonElement>(json);

            var profile = data.GetProperty("item");

            return new MyFitnessPalUserProfile
            {
                Username = profile.TryGetProperty("username", out var username) ? username.GetString() : null,
                FirstName = profile.TryGetProperty("first_name", out var firstName) ? firstName.GetString() : null,
                LastName = profile.TryGetProperty("last_name", out var lastName) ? lastName.GetString() : null,
                Gender = profile.TryGetProperty("gender", out var gender) ? gender.GetString() : null,
                Age = profile.TryGetProperty("age", out var age) ? age.GetInt32() : null,
                HeightCm = profile.TryGetProperty("height_cm", out var height) ? height.GetDecimal() : null,
                WeightKg = profile.TryGetProperty("weight_kg", out var weight) ? weight.GetDecimal() : null,
                GoalWeightKg = profile.TryGetProperty("goal_weight_kg", out var goalWeight) ? goalWeight.GetDecimal() : null,
                CalorieGoal = profile.TryGetProperty("calorie_goal", out var calorieGoal) ? calorieGoal.GetInt32() : null
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to get MyFitnessPal user profile");
            return null;
        }
    }

    public async Task<List<MyFitnessPalDiaryEntry>> GetDiaryEntriesAsync(string accessToken, DateOnly? startDate = null, DateOnly? endDate = null)
    {
        try
        {
            httpClient.DefaultRequestHeaders.Authorization = new("Bearer", accessToken);

            var start = startDate ?? DateOnly.FromDateTime(DateTime.Today.AddDays(-7));
            var end = endDate ?? DateOnly.FromDateTime(DateTime.Today);

            var entries = new List<MyFitnessPalDiaryEntry>();

            for (var date = start; date <= end; date = date.AddDays(1))
            {
                var dayEntries = await GetDiaryEntriesForDateAsync(accessToken, date);
                entries.AddRange(dayEntries);
            }

            return entries;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to get MyFitnessPal diary entries");
            return new List<MyFitnessPalDiaryEntry>();
        }
    }

    public async Task<List<MyFitnessPalDiaryEntry>> GetDiaryEntriesForDateAsync(string accessToken, DateOnly date)
    {
        try
        {
            httpClient.DefaultRequestHeaders.Authorization = new("Bearer", accessToken);

            var dateString = date.ToString("yyyy-MM-dd");
            var response = await httpClient.GetAsync($"https://api.myfitnesspal.com/v2/diary/{dateString}");

            if (!response.IsSuccessStatusCode)
                return new List<MyFitnessPalDiaryEntry>();

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<JsonElement>(json);

            var entries = new List<MyFitnessPalDiaryEntry>();
            var diary = data.GetProperty("item");

            // Parse meals
            if (diary.TryGetProperty("meals", out var meals))
            {
                foreach (var meal in meals.EnumerateArray())
                {
                    var mealName = meal.GetProperty("name").GetString() ?? "";

                    if (meal.TryGetProperty("foods", out var foods))
                    {
                        foreach (var food in foods.EnumerateArray())
                        {
                            entries.Add(ParseDiaryEntry(food, date, mealName));
                        }
                    }
                }
            }

            return entries;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to get MyFitnessPal diary entries for {Date}", date);
            return new List<MyFitnessPalDiaryEntry>();
        }
    }

    public async Task<MyFitnessPalNutritionSummary?> GetNutritionSummaryAsync(string accessToken, DateOnly date)
    {
        try
        {
            httpClient.DefaultRequestHeaders.Authorization = new("Bearer", accessToken);

            var dateString = date.ToString("yyyy-MM-dd");
            var response = await httpClient.GetAsync($"https://api.myfitnesspal.com/v2/diary/{dateString}");

            if (!response.IsSuccessStatusCode)
                return null;

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<JsonElement>(json);

            var diary = data.GetProperty("item");
            var totals = diary.GetProperty("totals");

            return new MyFitnessPalNutritionSummary
            {
                Date = date,
                Calories = totals.TryGetProperty("calories", out var calories) ? calories.GetDecimal() : 0,
                Carbs = totals.TryGetProperty("carbs", out var carbs) ? carbs.GetDecimal() : 0,
                Fat = totals.TryGetProperty("fat", out var fat) ? fat.GetDecimal() : 0,
                Protein = totals.TryGetProperty("protein", out var protein) ? protein.GetDecimal() : 0,
                Sodium = totals.TryGetProperty("sodium", out var sodium) ? sodium.GetDecimal() : 0,
                Sugar = totals.TryGetProperty("sugar", out var sugar) ? sugar.GetDecimal() : 0,
                Fiber = totals.TryGetProperty("fiber", out var fiber) ? fiber.GetDecimal() : 0
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to get MyFitnessPal nutrition summary for {Date}", date);
            return null;
        }
    }

    private MyFitnessPalDiaryEntry ParseDiaryEntry(JsonElement food, DateOnly date, string mealName)
    {
        return new MyFitnessPalDiaryEntry
        {
            Date = date,
            MealName = mealName,
            FoodName = food.TryGetProperty("name", out var name) ? name.GetString() ?? "" : "",
            BrandName = food.TryGetProperty("brand_name", out var brand) ? brand.GetString() : null,
            Quantity = food.TryGetProperty("quantity", out var quantity) ? quantity.GetDecimal() : 0,
            Unit = food.TryGetProperty("unit", out var unit) ? unit.GetString() ?? "" : "",
            Calories = food.TryGetProperty("calories", out var calories) ? calories.GetDecimal() : 0,
            Carbs = food.TryGetProperty("carbs", out var carbs) ? carbs.GetDecimal() : 0,
            Fat = food.TryGetProperty("fat", out var fat) ? fat.GetDecimal() : 0,
            Protein = food.TryGetProperty("protein", out var protein) ? protein.GetDecimal() : 0,
            Sodium = food.TryGetProperty("sodium", out var sodium) ? sodium.GetDecimal() : null,
            Sugar = food.TryGetProperty("sugar", out var sugar) ? sugar.GetDecimal() : null,
            Fiber = food.TryGetProperty("fiber", out var fiber) ? fiber.GetDecimal() : null
        };
    }
}

public class MyFitnessPalUserProfile
{
    public string? Username { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Gender { get; set; }
    public int? Age { get; set; }
    public decimal? HeightCm { get; set; }
    public decimal? WeightKg { get; set; }
    public decimal? GoalWeightKg { get; set; }
    public int? CalorieGoal { get; set; }
}

public class MyFitnessPalDiaryEntry
{
    public DateOnly Date { get; set; }
    public string MealName { get; set; } = string.Empty;
    public string FoodName { get; set; } = string.Empty;
    public string? BrandName { get; set; }
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public decimal Calories { get; set; }
    public decimal Carbs { get; set; }
    public decimal Fat { get; set; }
    public decimal Protein { get; set; }
    public decimal? Sodium { get; set; }
    public decimal? Sugar { get; set; }
    public decimal? Fiber { get; set; }
}

public class MyFitnessPalNutritionSummary
{
    public DateOnly Date { get; set; }
    public decimal Calories { get; set; }
    public decimal Carbs { get; set; }
    public decimal Fat { get; set; }
    public decimal Protein { get; set; }
    public decimal Sodium { get; set; }
    public decimal Sugar { get; set; }
    public decimal Fiber { get; set; }
}
