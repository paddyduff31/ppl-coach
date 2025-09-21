using PplCoach.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;

namespace PplCoach.Domain.Entities;

public class WorkoutSession
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public DateOnly Date { get; set; }
    public DayType DayType { get; set; }
    public string? Notes { get; set; }
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public int? Duration { get; set; } // Duration in minutes
    public bool IsCompleted { get; set; }

    public UserProfile User { get; set; } = null!;
    public List<SetLog> SetLogs { get; set; } = new();
    
    // Calculated properties
    public decimal TotalVolume => SetLogs.Sum(s => s.WeightKg * s.Reps);
    public double? AverageRpe => SetLogs.Where(s => s.Rpe.HasValue).Any() 
        ? SetLogs.Where(s => s.Rpe.HasValue).Average(s => s.Rpe!.Value) 
        : null;
}