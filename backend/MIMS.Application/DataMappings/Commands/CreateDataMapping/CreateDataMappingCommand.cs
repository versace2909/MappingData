using MediatR;

namespace MIMS.Application.DataMappings.Commands.CreateDataMapping;

public record CreateDataMappingCommand(
    string MappingName,
    int SourceDataId,
    int TargetDataId) : IRequest<CreateDataMappingResult>;
