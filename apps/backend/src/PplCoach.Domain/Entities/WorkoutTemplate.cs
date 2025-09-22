namespace PplCoach.Domain.Entities;

public class WorkoutTemplate
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<WorkoutTemplateItem> Items { get; set; } = new();
}