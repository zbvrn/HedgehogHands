using Microsoft.AspNetCore.Identity;
using ServiceDesk.API.Models;

namespace ServiceDesk.API.Data;

public static class DbInitializer
{
    private record SeedUser(string Email, string Password, string DisplayName, string Role);

    private static readonly SeedUser[] Users =
    [
        new("admin@demo.com",     "Admin123!",    "Admin",        "Admin"),
        new("operator1@demo.com", "Operator123!", "Operator One", "Operator"),
        new("operator2@demo.com", "Operator123!", "Operator Two", "Operator"),
        new("student1@demo.com",  "Student123!",  "Student One",  "Student"),
        new("student2@demo.com",  "Student123!",  "Student Two",  "Student"),
        new("student3@demo.com",  "Student123!",  "Student Three","Student"),
    ];

    public static async Task SeedAsync(IServiceProvider services)
    {
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var logger = services.GetRequiredService<ILogger<AppDbContext>>();

        foreach (var seed in Users)
        {
            if (await userManager.FindByEmailAsync(seed.Email) is not null)
                continue;

            var user = new ApplicationUser
            {
                UserName = seed.Email,
                Email = seed.Email,
                DisplayName = seed.DisplayName
            };

            var result = await userManager.CreateAsync(user, seed.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                logger.LogError("Failed to seed user {Email}: {Errors}", seed.Email, errors);
                continue;
            }

            var roleResult = await userManager.AddToRoleAsync(user, seed.Role);
            if (!roleResult.Succeeded)
            {
                var errors = string.Join(", ", roleResult.Errors.Select(e => e.Description));
                logger.LogError("Failed to assign role {Role} to {Email}: {Errors}", seed.Role, seed.Email, errors);
                continue;
            }

            logger.LogInformation("Seeded user {Email} with role {Role}", seed.Email, seed.Role);
        }
    }
}
