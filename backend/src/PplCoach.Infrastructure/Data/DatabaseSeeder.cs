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
            new Movement { Id = Guid.NewGuid(), Name = "Dumbbell Flyes", MuscleGroup = MuscleGroup.Chest, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Dumbbell | EquipmentType.Bench },
            new Movement { Id = Guid.NewGuid(), Name = "Push-ups", MuscleGroup = MuscleGroup.Chest, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Bodyweight },

            // Push - Shoulders
            new Movement { Id = Guid.NewGuid(), Name = "Dumbbell Shoulder Press", MuscleGroup = MuscleGroup.Shoulders, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Lateral Raises", MuscleGroup = MuscleGroup.Shoulders, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Arnold Press", MuscleGroup = MuscleGroup.Shoulders, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Front Raises", MuscleGroup = MuscleGroup.Shoulders, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Dumbbell },

            // Push - Triceps
            new Movement { Id = Guid.NewGuid(), Name = "Dumbbell Overhead Extension", MuscleGroup = MuscleGroup.Triceps, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Dumbbell Kickbacks", MuscleGroup = MuscleGroup.Triceps, MovementPattern = MovementPattern.Push, Unilateral = true, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Close-Grip Push-ups", MuscleGroup = MuscleGroup.Triceps, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Bodyweight },

            // Pull - Back
            new Movement { Id = Guid.NewGuid(), Name = "Dumbbell Rows", MuscleGroup = MuscleGroup.Back, MovementPattern = MovementPattern.Pull, Unilateral = true, Requires = EquipmentType.Dumbbell | EquipmentType.Bench },
            new Movement { Id = Guid.NewGuid(), Name = "Bent-Over Dumbbell Row", MuscleGroup = MuscleGroup.Back, MovementPattern = MovementPattern.Pull, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Chest-Supported Row", MuscleGroup = MuscleGroup.Back, MovementPattern = MovementPattern.Pull, Unilateral = false, Requires = EquipmentType.Dumbbell | EquipmentType.Bench },
            new Movement { Id = Guid.NewGuid(), Name = "Reverse Flyes", MuscleGroup = MuscleGroup.RearDelts, MovementPattern = MovementPattern.Pull, Unilateral = false, Requires = EquipmentType.Dumbbell },

            // Pull - Biceps
            new Movement { Id = Guid.NewGuid(), Name = "Dumbbell Bicep Curls", MuscleGroup = MuscleGroup.Biceps, MovementPattern = MovementPattern.Pull, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Hammer Curls", MuscleGroup = MuscleGroup.Biceps, MovementPattern = MovementPattern.Pull, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Concentration Curls", MuscleGroup = MuscleGroup.Biceps, MovementPattern = MovementPattern.Pull, Unilateral = true, Requires = EquipmentType.Dumbbell },

            // Legs - Quads
            new Movement { Id = Guid.NewGuid(), Name = "Dumbbell Squats", MuscleGroup = MuscleGroup.Quads, MovementPattern = MovementPattern.Squat, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Bulgarian Split Squats", MuscleGroup = MuscleGroup.Quads, MovementPattern = MovementPattern.Squat, Unilateral = true, Requires = EquipmentType.Dumbbell | EquipmentType.Bench },
            new Movement { Id = Guid.NewGuid(), Name = "Lunges", MuscleGroup = MuscleGroup.Quads, MovementPattern = MovementPattern.Squat, Unilateral = true, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Step-ups", MuscleGroup = MuscleGroup.Quads, MovementPattern = MovementPattern.Squat, Unilateral = true, Requires = EquipmentType.Dumbbell | EquipmentType.Bench },

            // Legs - Hamstrings/Glutes
            new Movement { Id = Guid.NewGuid(), Name = "Romanian Deadlifts", MuscleGroup = MuscleGroup.Hamstrings, MovementPattern = MovementPattern.Hinge, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Single-Leg RDL", MuscleGroup = MuscleGroup.Hamstrings, MovementPattern = MovementPattern.Hinge, Unilateral = true, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Dumbbell Hip Thrusts", MuscleGroup = MuscleGroup.Glutes, MovementPattern = MovementPattern.Hinge, Unilateral = false, Requires = EquipmentType.Dumbbell | EquipmentType.Bench },
            new Movement { Id = Guid.NewGuid(), Name = "Goblet Squats", MuscleGroup = MuscleGroup.Glutes, MovementPattern = MovementPattern.Squat, Unilateral = false, Requires = EquipmentType.Dumbbell },

            // Legs - Calves
            new Movement { Id = Guid.NewGuid(), Name = "Dumbbell Calf Raises", MuscleGroup = MuscleGroup.Calves, MovementPattern = MovementPattern.Push, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Single-Leg Calf Raises", MuscleGroup = MuscleGroup.Calves, MovementPattern = MovementPattern.Push, Unilateral = true, Requires = EquipmentType.Dumbbell },

            // Core
            new Movement { Id = Guid.NewGuid(), Name = "Plank", MuscleGroup = MuscleGroup.Core, MovementPattern = MovementPattern.Carry, Unilateral = false, Requires = EquipmentType.Bodyweight },
            new Movement { Id = Guid.NewGuid(), Name = "Russian Twists", MuscleGroup = MuscleGroup.Core, MovementPattern = MovementPattern.Carry, Unilateral = false, Requires = EquipmentType.Dumbbell },
            new Movement { Id = Guid.NewGuid(), Name = "Dead Bug", MuscleGroup = MuscleGroup.Core, MovementPattern = MovementPattern.Carry, Unilateral = true, Requires = EquipmentType.Bodyweight }
        };

        await context.Movements.AddRangeAsync(movements);
    }

    private static async Task SeedTemplatesAsync(PplCoachDbContext context)
    {
        var movements = await context.Movements.ToListAsync();

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

        var templates = new[] { pushTemplate, pullTemplate, legsTemplate };
        await context.WorkoutTemplates.AddRangeAsync(templates);
    }
}