using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PplCoach.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkoutSessionTimeFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Duration",
                table: "WorkoutSessions",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EndTime",
                table: "WorkoutSessions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsCompleted",
                table: "WorkoutSessions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "StartTime",
                table: "WorkoutSessions",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Duration",
                table: "WorkoutSessions");

            migrationBuilder.DropColumn(
                name: "EndTime",
                table: "WorkoutSessions");

            migrationBuilder.DropColumn(
                name: "IsCompleted",
                table: "WorkoutSessions");

            migrationBuilder.DropColumn(
                name: "StartTime",
                table: "WorkoutSessions");
        }
    }
}
