using MediatR;
using MIMS.Application.Common.Models;

namespace MIMS.Application.DataMappings.Queries.GetDataMappingDetails;

public record GetDataMappingDetailsQuery(
    int MappingId,
    int Page,
    int PageSize) : IRequest<PagedResult<DataMappingDetailItemDto>?>;
