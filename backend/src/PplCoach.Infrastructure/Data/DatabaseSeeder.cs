using Microsoft.EntityFrameworkCore;
using PplCoach.Domain.Entities;
using PplCoach.Domain.Enums;

namespace PplCoach.Infrastructure.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(PplCoachDbContext context)
    {
        try
        {
            if (await context.Movements.AnyAsync())
                return; // Already seeded
        }
        catch
        {
            // Tables don't exist yet, that's fine - continue seeding
        }

        await SeedUserProfilesAsync(context);
        await context.SaveChangesAsync();

        await SeedMovementsAsync(context);
        await context.SaveChangesAsync();

        await SeedTemplatesAsync(context);
        await context.SaveChangesAsync();
    }

    private static async Task SeedUserProfilesAsync(PplCoachDbContext context)
    {
        var developmentUser = new UserProfile
        {
            Id = Guid.Parse("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), // Match the frontend mock user ID
            Email = "dev@pplcoach.app",
            DisplayName = "Development User",
            HeightCm = 175.0m,
            BodyweightKg = 75.0m,
            CreatedAt = DateTime.UtcNow
        };

        await context.UserProfiles.AddAsync(developmentUser);
    }

    private static async Task SeedMovementsAsync(PplCoachDbContext context)
    {
        var movements = new[]
        {
            // Push - Chest
            new Movement { Id = Guid.NewGuid(), Name = "Dumbbell Bench Press", MuscleGroup = MuscleGroup.Chest, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Dumbbell | EquipmentType.Bench },
            new Movement { Id = Guid.NewGuid(), Name = "Incline Dumbbell Press", MuscleGroup = MuscleGroup.Chest, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Dumbbell | EquipmentType.Bench },
            new Movement { Id = Guid.NewGuid(), Name = "Decline Dumbbell Press", MuscleGroup = MuscleGroup.Chest, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Dumbbell | EquipmentType.Bench },
            new Movement { Id = Guid.NewGuid(), Name = "Dumbbell Flyes", MuscleGroup = MuscleGroup.Chest, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Dumbbell | EquipmentType.Bench },
            new Movement { Id = Guid.NewGuid(), Name = "Incline Dumbbell Flyes", MuscleGroup = MuscleGroup.Chest, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Dumbbell | EquipmentType.Bench },
            new Movement { Id = Guid.NewGuid(), Name = "Dumbbell Pullovers", MuscleGroup = MuscleGroup.Chest, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Dumbbell | EquipmentType.Bench },
            new Movement { Id = Guid.NewGuid(), Name = "Push-ups", MuscleGroup = MuscleGroup.Chest, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Bodyweight },
            new Movement { Id = Guid.NewGuid(), Name = "Incline Push-ups", MuscleGroup = MuscleGroup.Chest, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Bodyweight | EquipmentType.Bench },
            new Movement { Id = Guid.NewGuid(), Name = "Decline Push-ups", MuscleGroup = MuscleGroup.Chest, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Bodyweight | EquipmentType.Bench },
            new Movement { Id = Guid.NewGuid(), Name = "Diamond Push-ups", MuscleGroup = MuscleGroup.Chest, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Bodyweight },
            new Movement { Id = Guid.NewGuid(), Name = "Single-Arm Dumbbell Press", MuscleGroup = MuscleGroup.Chest, MovementPattern = MovementPattern.Push, Unilateral = true, Requires = EquipmentType.Dumbbell | EquipmentType.Bench },

            // Push - Shoulders
            new Movement { Id = Guid.NewGuid(), Name = "Dumbbell Shoulder Press", MuscleGroup = MuscleGroup.Shoulders, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Single-Arm Dumbbell Press", MuscleGroup = MuscleGroup.Shoulders, MovementPattern = MovementPattern.Push, Unilateral = true, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Seated Dumbbell Press", MuscleGroup = MuscleGroup.Shoulders, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Dumbbell | EquipmentType.Bench },
            new Movement { Id = Guid.NewGuid(), Name = "Lateral Raises", MuscleGroup = MuscleGroup.Shoulders, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Single-Arm Lateral Raises", MuscleGroup = MuscleGroup.Shoulders, MovementPattern = MovementPattern.Push, Unilateral = true, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Leaning Lateral Raises", MuscleGroup = MuscleGroup.Shoulders, MovementPattern = MovementPattern.Push, Unilateral = true, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Arnold Press", MuscleGroup = MuscleGroup.Shoulders, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Front Raises", MuscleGroup = MuscleGroup.Shoulders, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "6-Ways", MuscleGroup = MuscleGroup.Shoulders, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Dumbbell Upright Rows", MuscleGroup = MuscleGroup.Shoulders, MovementPattern = MovementPattern.Pull, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Pike Push-ups", MuscleGroup = MuscleGroup.Shoulders, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Bodyweight },
            new Movement { Id = Guid.NewGuid(), Name = "Handstand Push-ups", MuscleGroup = MuscleGroup.Shoulders, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Bodyweight },

            // Push - Triceps
            new Movement { Id = Guid.NewGuid(), Name = "Dumbbell Overhead Extension", MuscleGroup = MuscleGroup.Triceps, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Single-Arm Overhead Extension", MuscleGroup = MuscleGroup.Triceps, MovementPattern = MovementPattern.Push, Unilateral = true, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Dumbbell Kickbacks", MuscleGroup = MuscleGroup.Triceps, MovementPattern = MovementPattern.Push, Unilateral = true, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Lying Dumbbell Extension", MuscleGroup = MuscleGroup.Triceps, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Dumbbell | EquipmentType.Bench },
            new Movement { Id = Guid.NewGuid(), Name = "Tate Press", MuscleGroup = MuscleGroup.Triceps, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Dumbbell | EquipmentType.Bench },
            new Movement { Id = Guid.NewGuid(), Name = "Close-Grip Push-ups", MuscleGroup = MuscleGroup.Triceps, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Bodyweight },
            new Movement { Id = Guid.NewGuid(), Name = "Tricep Dips", MuscleGroup = MuscleGroup.Triceps, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Bodyweight | EquipmentType.Bench },
            new Movement { Id = Guid.NewGuid(), Name = "Dumbbell JM Press", MuscleGroup = MuscleGroup.Triceps, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Dumbbell | EquipmentType.Bench },

            // Pull - Back
            new Movement { Id = Guid.NewGuid(), Name = "Dumbbell Rows", MuscleGroup = MuscleGroup.Back, MovementPattern = MovementPattern.Pull, Unilateral = true, Requires = EquipmentType.Dumbbell | EquipmentType.Bench },
            new Movement { Id = Guid.NewGuid(), Name = "Bent-Over Dumbbell Row", MuscleGroup = MuscleGroup.Back, MovementPattern = MovementPattern.Pull, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Chest-Supported Row", MuscleGroup = MuscleGroup.Back, MovementPattern = MovementPattern.Pull, Unilateral = false, Requires = EquipmentType.Dumbbell | EquipmentType.Bench },
            new Movement { Id = Guid.NewGuid(), Name = "Single-Arm Row", MuscleGroup = MuscleGroup.Back, MovementPattern = MovementPattern.Pull, Unilateral = true, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Renegade Rows", MuscleGroup = MuscleGroup.Back, MovementPattern = MovementPattern.Pull, Unilateral = true, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "T-Bar Rows", MuscleGroup = MuscleGroup.Back, MovementPattern = MovementPattern.Pull, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Meadows Rows", MuscleGroup = MuscleGroup.Back, MovementPattern = MovementPattern.Pull, Unilateral = true, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Seal Rows", MuscleGroup = MuscleGroup.Back, MovementPattern = MovementPattern.Pull, Unilateral = false, Requires = EquipmentType.Dumbbell | EquipmentType.Bench },
            new Movement { Id = Guid.NewGuid(), Name = "Inverted Rows", MuscleGroup = MuscleGroup.Back, MovementPattern = MovementPattern.Pull, Unilateral = false, Requires = EquipmentType.Bodyweight },

            // Pull - Rear Delts
            new Movement { Id = Guid.NewGuid(), Name = "Reverse Flyes", MuscleGroup = MuscleGroup.RearDelts, MovementPattern = MovementPattern.Pull, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Bent-Over Reverse Flyes", MuscleGroup = MuscleGroup.RearDelts, MovementPattern = MovementPattern.Pull, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Face Pulls", MuscleGroup = MuscleGroup.RearDelts, MovementPattern = MovementPattern.Pull, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "High Pulls", MuscleGroup = MuscleGroup.RearDelts, MovementPattern = MovementPattern.Pull, Unilateral = false, Requires = EquipmentType.Dumbbell },

            // Pull - Biceps
            new Movement { Id = Guid.NewGuid(), Name = "Dumbbell Bicep Curls", MuscleGroup = MuscleGroup.Biceps, MovementPattern = MovementPattern.Pull, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Alternating Dumbbell Curls", MuscleGroup = MuscleGroup.Biceps, MovementPattern = MovementPattern.Pull, Unilateral = true, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Hammer Curls", MuscleGroup = MuscleGroup.Biceps, MovementPattern = MovementPattern.Pull, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Cross-Body Hammer Curls", MuscleGroup = MuscleGroup.Biceps, MovementPattern = MovementPattern.Pull, Unilateral = true, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Concentration Curls", MuscleGroup = MuscleGroup.Biceps, MovementPattern = MovementPattern.Pull, Unilateral = true, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Incline Dumbbell Curls", MuscleGroup = MuscleGroup.Biceps, MovementPattern = MovementPattern.Pull, Unilateral = false, Requires = EquipmentType.Dumbbell | EquipmentType.Bench },
            new Movement { Id = Guid.NewGuid(), Name = "Preacher Curls", MuscleGroup = MuscleGroup.Biceps, MovementPattern = MovementPattern.Pull, Unilateral = false, Requires = EquipmentType.Dumbbell | EquipmentType.Bench },
            new Movement { Id = Guid.NewGuid(), Name = "Zottman Curls", MuscleGroup = MuscleGroup.Biceps, MovementPattern = MovementPattern.Pull, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "21s Bicep Curls", MuscleGroup = MuscleGroup.Biceps, MovementPattern = MovementPattern.Pull, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Spider Curls", MuscleGroup = MuscleGroup.Biceps, MovementPattern = MovementPattern.Pull, Unilateral = false, Requires = EquipmentType.Dumbbell | EquipmentType.Bench },

            // Legs - Quads
            new Movement { Id = Guid.NewGuid(), Name = "Dumbbell Squats", MuscleGroup = MuscleGroup.Quads, MovementPattern = MovementPattern.Squat, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Front Squats", MuscleGroup = MuscleGroup.Quads, MovementPattern = MovementPattern.Squat, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Bulgarian Split Squats", MuscleGroup = MuscleGroup.Quads, MovementPattern = MovementPattern.Squat, Unilateral = true, Requires = EquipmentType.Dumbbell | EquipmentType.Bench },
            new Movement { Id = Guid.NewGuid(), Name = "Reverse Lunges", MuscleGroup = MuscleGroup.Quads, MovementPattern = MovementPattern.Squat, Unilateral = true, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Walking Lunges", MuscleGroup = MuscleGroup.Quads, MovementPattern = MovementPattern.Squat, Unilateral = true, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Lateral Lunges", MuscleGroup = MuscleGroup.Quads, MovementPattern = MovementPattern.Squat, Unilateral = true, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Step-ups", MuscleGroup = MuscleGroup.Quads, MovementPattern = MovementPattern.Squat, Unilateral = true, Requires = EquipmentType.Dumbbell | EquipmentType.Bench },
            new Movement { Id = Guid.NewGuid(), Name = "Jump Squats", MuscleGroup = MuscleGroup.Quads, MovementPattern = MovementPattern.Squat, Unilateral = false, Requires = EquipmentType.Bodyweight },
            new Movement { Id = Guid.NewGuid(), Name = "Pistol Squats", MuscleGroup = MuscleGroup.Quads, MovementPattern = MovementPattern.Squat, Unilateral = true, Requires = EquipmentType.Bodyweight },
            new Movement { Id = Guid.NewGuid(), Name = "Shrimp Squats", MuscleGroup = MuscleGroup.Quads, MovementPattern = MovementPattern.Squat, Unilateral = true, Requires = EquipmentType.Bodyweight },

            // Legs - Hamstrings/Glutes
            new Movement { Id = Guid.NewGuid(), Name = "Romanian Deadlifts", MuscleGroup = MuscleGroup.Hamstrings, MovementPattern = MovementPattern.Hinge, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Single-Leg RDL", MuscleGroup = MuscleGroup.Hamstrings, MovementPattern = MovementPattern.Hinge, Unilateral = true, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Stiff-Leg Deadlifts", MuscleGroup = MuscleGroup.Hamstrings, MovementPattern = MovementPattern.Hinge, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Good Mornings", MuscleGroup = MuscleGroup.Hamstrings, MovementPattern = MovementPattern.Hinge, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Dumbbell Hip Thrusts", MuscleGroup = MuscleGroup.Glutes, MovementPattern = MovementPattern.Hinge, Unilateral = false, Requires = EquipmentType.Dumbbell | EquipmentType.Bench },
            new Movement { Id = Guid.NewGuid(), Name = "Single-Leg Hip Thrusts", MuscleGroup = MuscleGroup.Glutes, MovementPattern = MovementPattern.Hinge, Unilateral = true, Requires = EquipmentType.Dumbbell | EquipmentType.Bench },
            new Movement { Id = Guid.NewGuid(), Name = "Goblet Squats", MuscleGroup = MuscleGroup.Glutes, MovementPattern = MovementPattern.Squat, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Sumo Squats", MuscleGroup = MuscleGroup.Glutes, MovementPattern = MovementPattern.Squat, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Curtsy Lunges", MuscleGroup = MuscleGroup.Glutes, MovementPattern = MovementPattern.Squat, Unilateral = true, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Glute Bridges", MuscleGroup = MuscleGroup.Glutes, MovementPattern = MovementPattern.Hinge, Unilateral = false, Requires = EquipmentType.Bodyweight },
            new Movement { Id = Guid.NewGuid(), Name = "Single-Leg Glute Bridges", MuscleGroup = MuscleGroup.Glutes, MovementPattern = MovementPattern.Hinge, Unilateral = true, Requires = EquipmentType.Bodyweight },

            // Legs - Calves
            new Movement { Id = Guid.NewGuid(), Name = "Dumbbell Calf Raises", MuscleGroup = MuscleGroup.Calves, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Single-Leg Calf Raises", MuscleGroup = MuscleGroup.Calves, MovementPattern = MovementPattern.Push, Unilateral = true, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Seated Calf Raises", MuscleGroup = MuscleGroup.Calves, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Dumbbell | EquipmentType.Bench },
            new Movement { Id = Guid.NewGuid(), Name = "Donkey Calf Raises", MuscleGroup = MuscleGroup.Calves, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Dumbbell | EquipmentType.Bench },
            new Movement { Id = Guid.NewGuid(), Name = "Jump Rope", MuscleGroup = MuscleGroup.Calves, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Bodyweight },

            // Core
            new Movement { Id = Guid.NewGuid(), Name = "Plank", MuscleGroup = MuscleGroup.Core, MovementPattern = MovementPattern.Carry, Unilateral = false, Requires = EquipmentType.Bodyweight },
            new Movement { Id = Guid.NewGuid(), Name = "Side Plank", MuscleGroup = MuscleGroup.Core, MovementPattern = MovementPattern.Carry, Unilateral = true, Requires = EquipmentType.Bodyweight },
            new Movement { Id = Guid.NewGuid(), Name = "Russian Twists", MuscleGroup = MuscleGroup.Core, MovementPattern = MovementPattern.Carry, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Dead Bug", MuscleGroup = MuscleGroup.Core, MovementPattern = MovementPattern.Carry, Unilateral = true, Requires = EquipmentType.Bodyweight },
            new Movement { Id = Guid.NewGuid(), Name = "Bird Dog", MuscleGroup = MuscleGroup.Core, MovementPattern = MovementPattern.Carry, Unilateral = true, Requires = EquipmentType.Bodyweight },
            new Movement { Id = Guid.NewGuid(), Name = "Mountain Climbers", MuscleGroup = MuscleGroup.Core, MovementPattern = MovementPattern.Carry, Unilateral = true, Requires = EquipmentType.Bodyweight },
            new Movement { Id = Guid.NewGuid(), Name = "Bicycle Crunches", MuscleGroup = MuscleGroup.Core, MovementPattern = MovementPattern.Carry, Unilateral = true, Requires = EquipmentType.Bodyweight },
            new Movement { Id = Guid.NewGuid(), Name = "Hanging Knee Raises", MuscleGroup = MuscleGroup.Core, MovementPattern = MovementPattern.Pull, Unilateral = false, Requires = EquipmentType.Bodyweight },
            new Movement { Id = Guid.NewGuid(), Name = "Dumbbell Woodchops", MuscleGroup = MuscleGroup.Core, MovementPattern = MovementPattern.Carry, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Turkish Get-ups", MuscleGroup = MuscleGroup.Core, MovementPattern = MovementPattern.Carry, Unilateral = true, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Farmers Walk", MuscleGroup = MuscleGroup.Core, MovementPattern = MovementPattern.Carry, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Suitcase Carry", MuscleGroup = MuscleGroup.Core, MovementPattern = MovementPattern.Carry, Unilateral = true, Requires = EquipmentType.Dumbbell },

            // Full Body / Compound
            new Movement { Id = Guid.NewGuid(), Name = "Burpees", MuscleGroup = MuscleGroup.Core, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Bodyweight },
            new Movement { Id = Guid.NewGuid(), Name = "Dumbbell Thrusters", MuscleGroup = MuscleGroup.Shoulders, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Dumbbell Clean & Press", MuscleGroup = MuscleGroup.Shoulders, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Man Makers", MuscleGroup = MuscleGroup.Core, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Dumbbell Snatches", MuscleGroup = MuscleGroup.Shoulders, MovementPattern = MovementPattern.Pull, Unilateral = true, Requires = EquipmentType.Dumbbell }
        };

        await context.Movements.AddRangeAsync(movements);
    }

    private static async Task SeedTemplatesAsync(PplCoachDbContext context)
    {
        var movements = await context.Movements.ToListAsync();

        // Original PPL Templates
        var pushTemplate = new WorkoutTemplate
        {
            Id = Guid.NewGuid(),
            Name = "Push Day (Chest, Shoulders, Triceps)",
            Items = new List<WorkoutTemplateItem>
            {
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Dumbbell Bench Press").Id, DefaultSets = 4, RepsLow = 8, RepsHigh = 12, Notes = "Compound movement - go heavy" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Dumbbell Shoulder Press").Id, DefaultSets = 3, RepsLow = 10, RepsHigh = 15, Notes = "Control the weight" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Incline Dumbbell Press").Id, DefaultSets = 3, RepsLow = 10, RepsHigh = 12, Notes = "Upper chest focus" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Lateral Raises").Id, DefaultSets = 3, RepsLow = 12, RepsHigh = 20, Notes = "Light weight, focus on form" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Dumbbell Overhead Extension").Id, DefaultSets = 3, RepsLow = 12, RepsHigh = 15, Notes = "Triceps finisher" }
            }
        };

        var pullTemplate = new WorkoutTemplate
        {
            Id = Guid.NewGuid(),
            Name = "Pull Day (Back, Biceps, Rear Delts)",
            Items = new List<WorkoutTemplateItem>
            {
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Bent-Over Dumbbell Row").Id, DefaultSets = 4, RepsLow = 8, RepsHigh = 12, Notes = "Keep back straight" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Dumbbell Rows").Id, DefaultSets = 3, RepsLow = 10, RepsHigh = 12, Notes = "Each arm" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Reverse Flyes").Id, DefaultSets = 3, RepsLow = 12, RepsHigh = 20, Notes = "Rear delt focus" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Dumbbell Bicep Curls").Id, DefaultSets = 3, RepsLow = 12, RepsHigh = 15, Notes = "Squeeze at the top" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Hammer Curls").Id, DefaultSets = 3, RepsLow = 12, RepsHigh = 15, Notes = "Neutral grip" }
            }
        };

        var legsTemplate = new WorkoutTemplate
        {
            Id = Guid.NewGuid(),
            Name = "Legs Day (Quads, Hamstrings, Glutes, Calves)",
            Items = new List<WorkoutTemplateItem>
            {
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Dumbbell Squats").Id, DefaultSets = 4, RepsLow = 8, RepsHigh = 15, Notes = "Full depth" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Romanian Deadlifts").Id, DefaultSets = 4, RepsLow = 10, RepsHigh = 12, Notes = "Hip hinge pattern" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Bulgarian Split Squats").Id, DefaultSets = 3, RepsLow = 12, RepsHigh = 15, Notes = "Each leg" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Dumbbell Hip Thrusts").Id, DefaultSets = 3, RepsLow = 15, RepsHigh = 20, Notes = "Glute squeeze" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Dumbbell Calf Raises").Id, DefaultSets = 4, RepsLow = 15, RepsHigh = 25, Notes = "Full range of motion" }
            }
        };

        // Advanced PPL Templates
        var pushAdvanced = new WorkoutTemplate
        {
            Id = Guid.NewGuid(),
            Name = "Advanced Push Day",
            Items = new List<WorkoutTemplateItem>
            {
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Dumbbell Bench Press").Id, DefaultSets = 5, RepsLow = 6, RepsHigh = 8, Notes = "Heavy compound movement" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Incline Dumbbell Press").Id, DefaultSets = 4, RepsLow = 8, RepsHigh = 10, Notes = "Upper chest development" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Decline Dumbbell Press").Id, DefaultSets = 3, RepsLow = 10, RepsHigh = 12, Notes = "Lower chest emphasis" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Arnold Press").Id, DefaultSets = 4, RepsLow = 10, RepsHigh = 12, Notes = "Full shoulder development" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Lateral Raises").Id, DefaultSets = 4, RepsLow = 15, RepsHigh = 20, Notes = "Side delt isolation" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Front Raises").Id, DefaultSets = 3, RepsLow = 12, RepsHigh = 15, Notes = "Front delt focus" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Lying Dumbbell Extension").Id, DefaultSets = 4, RepsLow = 10, RepsHigh = 12, Notes = "Tricep mass builder" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Dumbbell Kickbacks").Id, DefaultSets = 3, RepsLow = 12, RepsHigh = 15, Notes = "Tricep isolation finisher" }
            }
        };

        var pullAdvanced = new WorkoutTemplate
        {
            Id = Guid.NewGuid(),
            Name = "Advanced Pull Day",
            Items = new List<WorkoutTemplateItem>
            {
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Bent-Over Dumbbell Row").Id, DefaultSets = 5, RepsLow = 6, RepsHigh = 8, Notes = "Heavy back builder" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Chest-Supported Row").Id, DefaultSets = 4, RepsLow = 8, RepsHigh = 10, Notes = "Strict form focus" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Single-Arm Row").Id, DefaultSets = 3, RepsLow = 10, RepsHigh = 12, Notes = "Each arm - unilateral strength" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Reverse Flyes").Id, DefaultSets = 4, RepsLow = 15, RepsHigh = 20, Notes = "Rear delt development" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Face Pulls").Id, DefaultSets = 3, RepsLow = 15, RepsHigh = 20, Notes = "Posture and rear delts" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Incline Dumbbell Curls").Id, DefaultSets = 4, RepsLow = 10, RepsHigh = 12, Notes = "Stretched position curls" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Hammer Curls").Id, DefaultSets = 3, RepsLow = 12, RepsHigh = 15, Notes = "Brachialis development" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Concentration Curls").Id, DefaultSets = 3, RepsLow = 12, RepsHigh = 15, Notes = "Peak contraction focus" }
            }
        };

        var legsAdvanced = new WorkoutTemplate
        {
            Id = Guid.NewGuid(),
            Name = "Advanced Legs Day",
            Items = new List<WorkoutTemplateItem>
            {
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Front Squats").Id, DefaultSets = 5, RepsLow = 6, RepsHigh = 8, Notes = "Quad-dominant heavy movement" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Romanian Deadlifts").Id, DefaultSets = 4, RepsLow = 8, RepsHigh = 10, Notes = "Hamstring and glute focus" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Bulgarian Split Squats").Id, DefaultSets = 4, RepsLow = 10, RepsHigh = 12, Notes = "Each leg - unilateral strength" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Walking Lunges").Id, DefaultSets = 3, RepsLow = 12, RepsHigh = 15, Notes = "Dynamic leg movement" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Single-Leg RDL").Id, DefaultSets = 3, RepsLow = 10, RepsHigh = 12, Notes = "Each leg - balance and strength" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Dumbbell Hip Thrusts").Id, DefaultSets = 4, RepsLow = 15, RepsHigh = 20, Notes = "Glute activation" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Dumbbell Calf Raises").Id, DefaultSets = 5, RepsLow = 20, RepsHigh = 30, Notes = "High volume calf work" }
            }
        };

        // Bodyweight-Focused Templates
        var bodyweightUpper = new WorkoutTemplate
        {
            Id = Guid.NewGuid(),
            Name = "Bodyweight Upper Body",
            Items = new List<WorkoutTemplateItem>
            {
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Push-ups").Id, DefaultSets = 4, RepsLow = 10, RepsHigh = 20, Notes = "Basic push movement" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Incline Push-ups").Id, DefaultSets = 3, RepsLow = 8, RepsHigh = 15, Notes = "Upper chest focus" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Pike Push-ups").Id, DefaultSets = 3, RepsLow = 5, RepsHigh = 12, Notes = "Shoulder development" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Tricep Dips").Id, DefaultSets = 3, RepsLow = 8, RepsHigh = 15, Notes = "Tricep strength" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Inverted Rows").Id, DefaultSets = 4, RepsLow = 8, RepsHigh = 15, Notes = "Pulling movement" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Plank").Id, DefaultSets = 3, RepsLow = 30, RepsHigh = 60, Notes = "Core stability - hold for time" }
            }
        };

        var bodyweightLower = new WorkoutTemplate
        {
            Id = Guid.NewGuid(),
            Name = "Bodyweight Lower Body",
            Items = new List<WorkoutTemplateItem>
            {
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Jump Squats").Id, DefaultSets = 4, RepsLow = 12, RepsHigh = 20, Notes = "Explosive leg power" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Pistol Squats").Id, DefaultSets = 3, RepsLow = 3, RepsHigh = 8, Notes = "Each leg - advanced movement" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Glute Bridges").Id, DefaultSets = 4, RepsLow = 15, RepsHigh = 25, Notes = "Glute activation" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Single-Leg Glute Bridges").Id, DefaultSets = 3, RepsLow = 10, RepsHigh = 15, Notes = "Each leg - unilateral strength" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Single-Leg Calf Raises").Id, DefaultSets = 4, RepsLow = 15, RepsHigh = 25, Notes = "Each leg - calf strength" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Mountain Climbers").Id, DefaultSets = 3, RepsLow = 20, RepsHigh = 40, Notes = "Dynamic core and legs" }
            }
        };

        // Full Body Templates
        var fullBodyBeginner = new WorkoutTemplate
        {
            Id = Guid.NewGuid(),
            Name = "Full Body Beginner",
            Items = new List<WorkoutTemplateItem>
            {
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Goblet Squats").Id, DefaultSets = 3, RepsLow = 10, RepsHigh = 15, Notes = "Full body compound" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Dumbbell Bench Press").Id, DefaultSets = 3, RepsLow = 8, RepsHigh = 12, Notes = "Upper body push" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Bent-Over Dumbbell Row").Id, DefaultSets = 3, RepsLow = 8, RepsHigh = 12, Notes = "Upper body pull" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Dumbbell Shoulder Press").Id, DefaultSets = 2, RepsLow = 10, RepsHigh = 15, Notes = "Shoulder development" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Romanian Deadlifts").Id, DefaultSets = 3, RepsLow = 10, RepsHigh = 12, Notes = "Hip hinge pattern" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Plank").Id, DefaultSets = 2, RepsLow = 20, RepsHigh = 45, Notes = "Core stability - hold for time" }
            }
        };

        var fullBodyAdvanced = new WorkoutTemplate
        {
            Id = Guid.NewGuid(),
            Name = "Full Body Advanced",
            Items = new List<WorkoutTemplateItem>
            {
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Dumbbell Thrusters").Id, DefaultSets = 4, RepsLow = 8, RepsHigh = 12, Notes = "Full body compound movement" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Dumbbell Clean & Press").Id, DefaultSets = 4, RepsLow = 6, RepsHigh = 10, Notes = "Explosive full body" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Man Makers").Id, DefaultSets = 3, RepsLow = 5, RepsHigh = 8, Notes = "Complex full body movement" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Turkish Get-ups").Id, DefaultSets = 3, RepsLow = 3, RepsHigh = 5, Notes = "Each side - mobility and strength" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Renegade Rows").Id, DefaultSets = 3, RepsLow = 6, RepsHigh = 10, Notes = "Core and back strength" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Burpees").Id, DefaultSets = 3, RepsLow = 8, RepsHigh = 15, Notes = "Conditioning finisher" }
            }
        };

        // Strength-Focused Templates
        var strengthUpper = new WorkoutTemplate
        {
            Id = Guid.NewGuid(),
            Name = "Strength Upper Body",
            Items = new List<WorkoutTemplateItem>
            {
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Dumbbell Bench Press").Id, DefaultSets = 5, RepsLow = 3, RepsHigh = 6, Notes = "Heavy strength work" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Bent-Over Dumbbell Row").Id, DefaultSets = 5, RepsLow = 3, RepsHigh = 6, Notes = "Heavy pulling strength" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Dumbbell Shoulder Press").Id, DefaultSets = 4, RepsLow = 5, RepsHigh = 8, Notes = "Overhead strength" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Close-Grip Push-ups").Id, DefaultSets = 3, RepsLow = 5, RepsHigh = 10, Notes = "Tricep strength" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Farmers Walk").Id, DefaultSets = 3, RepsLow = 30, RepsHigh = 60, Notes = "Grip and core strength - walk for time" }
            }
        };

        var strengthLower = new WorkoutTemplate
        {
            Id = Guid.NewGuid(),
            Name = "Strength Lower Body",
            Items = new List<WorkoutTemplateItem>
            {
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Front Squats").Id, DefaultSets = 5, RepsLow = 3, RepsHigh = 6, Notes = "Heavy squat strength" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Romanian Deadlifts").Id, DefaultSets = 5, RepsLow = 3, RepsHigh = 6, Notes = "Heavy hip hinge strength" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Bulgarian Split Squats").Id, DefaultSets = 4, RepsLow = 5, RepsHigh = 8, Notes = "Each leg - unilateral strength" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Single-Leg RDL").Id, DefaultSets = 3, RepsLow = 5, RepsHigh = 8, Notes = "Each leg - balance and strength" },
                new() { Id = Guid.NewGuid(), MovementId = movements.First(m => m.Name == "Suitcase Carry").Id, DefaultSets = 3, RepsLow = 30, RepsHigh = 60, Notes = "Each side - core stability - walk for time" }
            }
        };

        var templates = new[] {
            pushTemplate, pullTemplate, legsTemplate,
            pushAdvanced, pullAdvanced, legsAdvanced,
            bodyweightUpper, bodyweightLower,
            fullBodyBeginner, fullBodyAdvanced,
            strengthUpper, strengthLower
        };
        await context.WorkoutTemplates.AddRangeAsync(templates);
    }
}