using AutoMapper;
using PplCoach.Application.Models;
using PplCoach.Application.Models.Integrations;
using PplCoach.Domain.Entities;

namespace PplCoach.Application.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<UserProfile, UserProfileModel>();
        CreateMap<UpdateUserProfileModel, UserProfile>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Email, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore());

        CreateMap<Movement, MovementModel>();

        CreateMap<WorkoutSession, WorkoutSessionModel>();
        CreateMap<CreateSessionModel, WorkoutSession>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore())
            .ForMember(dest => dest.SetLogs, opt => opt.Ignore());

        CreateMap<SetLog, SetLogModel>()
            .ForMember(dest => dest.MovementName, opt => opt.MapFrom(src => src.Movement.Name));
        CreateMap<CreateSetLogModel, SetLog>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Session, opt => opt.Ignore())
            .ForMember(dest => dest.Movement, opt => opt.Ignore());

        // Integration mappings
        CreateMap<ThirdPartyIntegration, IntegrationModel>();
        CreateMap<IntegrationSyncLog, IntegrationSyncModel>();
    }
}