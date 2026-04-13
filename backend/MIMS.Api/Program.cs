using MIMS.Application;
using MIMS.Application.Common.Helpers;
using MIMS.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                builder.Configuration["Cors:AllowedOrigins"]?.Split(",") ?? ["http://localhost:3000"])
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseHttpsRedirection();
app.MapControllers();

app.MapGet("/api/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }))
    .WithName("HealthCheck")
    .WithOpenApi();

PharmaceuticalTextNormalizer.Initialize(
    unitExpansions: new Dictionary<string, string>
    {
        { "mg", "milligram" }, { "mL", "milliliter" }, { "mcg", "microgram" }, { "ng", "nanogram" },
        { "GM", "gram" }, { "g", "gram" }, { "L", "liter" }, { "IU", "international units" },
        { "MIU", "million international units" }, { "KIU", "kilo international units" },
        { "KU", "kilo units" }, { "U", "units" }, { "USPu", "USP units" }, { "AU", "allergen units" },
        { "Lf", "limes flocculentiae" }, { "mEq", "milliequivalent" }, { "CFU", "colony forming units" },
        { "PFU", "plaque forming units" }, { "TCID", "tissue culture infectious dose" },
        { "CCID", "cell culture infectious dose" }, { "ppm", "parts per million" },
        { "puff", "puff" }, { "dose", "dose" }, { "actuation", "actuation" }
    },
    gluedTokens: new Dictionary<string, string>
    {
        { "millioncells", "million cells" }, { "milllioncells", "million cells" },
        { "millioncellls", "million cells" }, { "billioncells", "billion cells" },
        { "cells", "cells" }, { "million", "million" }, { "billion", "billion" },
        { "metered", "metered" }, { "vial", "vial" }, { "sec", "seconds" },
        { "hr", "hours" }, { "min", "minutes" }
    },
    hyphenatedForms: new Dictionary<string, string>
    {
        { "GI-Irr-Sol", "gastrointestinal irrigation solution" },
        { "Inj-Lyo-Sol", "injection lyophilized solution" },
        { "Inj-Lyo-Soln", "injection lyophilized solution" },
        { "Inj-Lyo-Sus", "injection lyophilized suspension" },
        { "Inj-Lyo-Susp", "injection lyophilized suspension" },
        { "Inj-Lyo-Lip", "injection lyophilized liposomal" },
        { "Inf-Lyo-Soln", "infusion lyophilized solution" },
        { "Inh-Liq-Cap", "inhalation liquid capsule" },
        { "Pwd-Inj", "powder for injection" }, { "Pwd-Inf", "powder for infusion" },
        { "Pwd-Inhl", "powder for inhalation" }, { "Inj-Susp", "injection suspension" },
        { "Inj-Conc", "injection concentrate" }, { "Inj-Emul", "injection emulsion" },
        { "Inj-Soln", "injection solution" }, { "Inj-Lip", "injection liposomal" },
        { "Sol-Inj", "solution for injection" }, { "Sol-Inf", "solution for infusion" },
        { "Sol-Oral", "solution for oral use" }, { "PF-Inj", "prefilled injection" },
        { "PF-Syrg", "prefilled syringe" }, { "IO-Inj", "intraocular injection" },
        { "Dep-Inj", "depot injection" }, { "Lip-Inj", "liposomal injection" },
        { "Inf-Conc", "infusion concentrate" }, { "Inf-Emul", "infusion emulsion" },
        { "Inf-Sol", "infusion solution" }, { "Inf-Soln", "infusion solution" },
        { "DT-Tab", "dispersible tablet" }, { "Chw-Tab", "chewable tablet" },
        { "Ext-Tab", "extended-release tablet" }, { "Eff-Tab", "effervescent tablet" },
        { "SR-Tab", "sustained-release tablet" }, { "MR-Tab", "modified-release tablet" },
        { "FC-Tab", "film-coated tablet" }, { "CR-Tab", "controlled-release tablet" },
        { "ER-Tab", "extended-release tablet" }, { "Oro-Tab", "orodispersible tablet" },
        { "EC-Tab", "enteric-coated tablet" }, { "BL-Tab", "blister tablet" },
        { "PR-Tab", "prolonged-release tablet" }, { "SC-Tab", "sugar-coated tablet" },
        { "SL-Tab", "sublingual tablet" }, { "DR-Tab", "delayed-release tablet" },
        { "XR-Tab", "extended-release tablet" }, { "GR-Tab", "gastro-resistant tablet" },
        { "VG-Tab", "vaginal tablet" }, { "DS-Tab", "dispersible-soluble tablet" },
        { "RD-Tab", "rapid-dissolve tablet" }, { "IR-Tab", "immediate-release tablet" },
        { "RT-Tab", "retard tablet" }, { "OD-Tab", "once-daily tablet" },
        { "SG-Cap", "soft-gelatin capsule" }, { "MR-Cap", "modified-release capsule" },
        { "ER-Cap", "extended-release capsule" }, { "CR-Cap", "controlled-release capsule" },
        { "I-Cap", "inhalation capsule" }, { "Lyo-Cap", "lyophilized capsule" },
        { "SR-Cap", "sustained-release capsule" }, { "EC-Cap", "enteric-coated capsule" },
        { "DR-Cap", "delayed-release capsule" }, { "VG-Cap", "vaginal capsule" },
        { "TR-Cap", "time-release capsule" }, { "PR-Cap", "prolonged-release capsule" },
        { "GR-Cap", "gastro-resistant capsule" }, { "DS-Cap", "dispersible-soluble capsule" },
        { "R-Cap", "rectal capsule" }, { "O-Susp", "oral suspension" },
        { "O-Dps", "oral drops" }, { "O-Liq", "oral liquid" }, { "O-Liqd", "oral liquid" },
        { "O-Liquid", "oral liquid" }, { "O-Gel", "oral gel" }, { "O-Soln", "oral solution" },
        { "O-Sol", "oral solution" }, { "O-Gran", "oral granules" }, { "O-Emul", "oral emulsion" },
        { "O-Pwd", "oral powder" }, { "O-Powd", "oral powder" }, { "O-Jelly", "oral jelly" },
        { "O-Oil", "oral oil" }, { "D-Syr", "dry syrup" }, { "D-Syrup", "dry syrup" },
        { "D-Syp", "dry syrup" }, { "D-Sry", "dry syrup" }, { "D-Susp", "dry suspension" },
        { "T-Gel", "topical gel" }, { "T-Pwd", "topical powder" }, { "T-Paste", "topical paste" },
        { "T-Patch", "transdermal patch" }, { "T-Oil", "topical oil" },
        { "T-Appl", "topical application" }, { "T-Emul", "topical emulsion" },
        { "T-Crm", "topical cream" }, { "T-Soln", "topical solution" },
        { "T-Spry", "topical spray" }, { "T-Susp", "topical suspension" },
        { "T-Soltab", "topical soluble tablet" }, { "D-Patch", "dermal patch" },
        { "E/E-Dps", "eye or ear drops" }, { "Eye-Dps", "eye drops" },
        { "Eye-Oint", "eye ointment" }, { "Eye-Gel", "eye gel" },
        { "Eye-Soln", "eye solution" }, { "Eye-Susp", "eye suspension" },
        { "Eye-Crm", "eye cream" }, { "Ear-Dps", "ear drops" }, { "Ear-Spry", "ear spray" },
        { "N-Dps", "nasal drops" }, { "N-Spry", "nasal spray" }, { "N-Aer", "nasal aerosol" },
        { "N-Gel", "nasal gel" }, { "N-Sol", "nasal solution" }, { "N-Wash", "nasal wash" },
        { "N-Oint", "nasal ointment" }, { "N-Crm", "nasal cream" }, { "N-Lacq", "nail lacquer" },
        { "M-Wash", "mouthwash" }, { "M-Paint", "mouth paint" }, { "M-Gel", "mouth gel" },
        { "M-Haler", "metered-dose haler" }, { "Dnt-Gel", "dental gel" },
        { "Dnt-Sol", "dental solution" }, { "Dnt-Pas", "dental paste" },
        { "VG-Supp", "vaginal suppository" }, { "VG-Crm", "vaginal cream" },
        { "VG-Gel", "vaginal gel" }, { "VG-Wash", "vaginal wash" },
        { "R-Gel", "rectal gel" }, { "R-Crm", "rectal cream" },
        { "Inh-Sol", "inhalation solution" }, { "Inh-Vap", "inhalation vapour" },
        { "Aer-Spry", "aerosol spray" }, { "Neb-Sol", "nebulizer solution" },
        { "OM-Spry", "oromucosal spray" }, { "OM-Paste", "oromucosal paste" },
        { "OM-Sol", "oromucosal solution" }, { "OM-Oint", "oromucosal ointment" },
        { "OM-Gel", "oromucosal gel" }, { "EC-Gran", "enteric-coated granules" },
        { "S-Sol", "sublingual solution" }, { "S-Soln", "sublingual solution" },
        { "Irr-Sol", "irrigation solution" }, { "Chw-Gum", "chewing gum" },
        { "Emul-Gel", "emulsion gel" }, { "Eff-Gran", "effervescent granules" },
        { "Eff-Pwd", "effervescent powder" }, { "Vac-Inj", "vaccine injection" },
        { "E-Lotion", "emollient lotion" }
    },
    multiWordAbbr: new Dictionary<string, string>
    {
        { "powd for inj", "powder for injection" }, { "powd for oral", "powder for oral use" },
        { "powd for infusion", "powder for infusion" },
        { "powd for inhalation", "powder for inhalation" },
        { "soln for inj", "solution for injection" },
        { "soln for inhalation", "solution for inhalation" },
        { "susp for inj", "suspension for injection" },
        { "susp for inhalation", "suspension for inhalation" },
        { "film-coated tab", "film-coated tablet" }, { "dispersible tab", "dispersible tablet" },
        { "chewable tab", "chewable tablet" }, { "sublingual tab", "sublingual tablet" },
        { "orodispersible tab", "orodispersible tablet" },
        { "effervescent tab", "effervescent tablet" },
        { "modified release tab", "modified-release tablet" },
        { "modified release cap", "modified-release capsule" },
        { "extended release tablet", "extended-release tablet" },
        { "sustained release tablet", "sustained-release tablet" },
        { "controlled release tablet", "controlled-release tablet" },
        { "modified release tablet", "modified-release tablet" },
        { "soft-gelatin cap", "soft-gelatin capsule" },
        { "dispersible cap", "dispersible capsule" }, { "oral susp", "oral suspension" },
        { "oral liqd", "oral liquid" }, { "oral drops", "oral drops" },
        { "oral soln", "oral solution" }, { "topical soln", "topical solution" },
        { "topical gel", "topical gel" }, { "inhalation soln", "inhalation solution" },
        { "eye/ear drops", "eye or ear drops" }, { "vag tab", "vaginal tablet" },
        { "vag gel", "vaginal gel" }, { "vag cap", "vaginal capsule" },
        { "vag supp", "vaginal suppository" }, { "vag wash", "vaginal wash" },
        { "vag cream", "vaginal cream" }, { "vag soln", "vaginal solution" },
        { "vag insert", "vaginal insert" }, { "dry syr", "dry syrup" },
        { "nasal spray", "nasal spray" }, { "nasal drops", "nasal drops" },
        { "soln for infusion", "solution for infusion" },
        { "emulsion for infusion", "emulsion for infusion" },
        { "emulsion for inj", "emulsion for injection" },
        { "topical powd", "topical powder" }, { "topical liqd", "topical liquid" },
        { "oromucosal spray", "oromucosal spray" }, { "oromucosal liqd", "oromucosal liquid" },
        { "oromucosal soln", "oromucosal solution" },
        { "oral lyophilisate", "oral lyophilisate" }, { "powd for soln", "powder for solution" },
        { "capsule for inhalation", "capsule for inhalation" },
        { "oral paste", "oral paste" }, { "oral rinse", "oral rinse" }
    },
    singleWordAbbr: new Dictionary<string, string>
    {
        { "dispertab", "dispersible tablet" }, { "filcotab", "film-coated tablet" },
        { "autohaler", "autohaler" }, { "extentab", "extended-release tablet" },
        { "softcap", "soft capsule" }, { "rotacaps", "rotacap" }, { "rotacap", "rotacap" },
        { "rotocap", "rotacap" }, { "respules", "respules" }, { "respule", "respules" },
        { "penfill", "penfill" }, { "flexpen", "flexpen" }, { "inhaler", "inhaler" },
        { "linctus", "linctus" }, { "captab", "capsule tablet" },
        { "suscap", "sustained-release capsule" }, { "caplet", "caplet" },
        { "granules", "granules" }, { "sachet", "sachet" }, { "vaccine", "vaccine" },
        { "pellets", "pellets" }, { "enema", "enema" }, { "shamp", "shampoo" },
        { "strip", "strip" }, { "tab", "tablet" }, { "cap", "capsule" },
        { "inj", "injection" }, { "syr", "syrup" }, { "crm", "cream" },
        { "susp", "suspension" }, { "soln", "solution" }, { "oint", "ointment" },
        { "powd", "powder" }, { "pwd", "powder" }, { "lot", "lotion" },
        { "inf", "infusion" }, { "inh", "inhaler" }, { "liqd", "liquid" },
        { "liq", "liquid" }, { "supp", "suppository" }, { "loz", "lozenge" },
        { "elix", "elixir" }, { "pess", "pessary" }, { "resp", "respules" },
        { "spry", "spray" }, { "aer", "aerosol" }, { "wsh", "wash" },
        { "dps", "drops" }, { "sol", "solution" }, { "soap", "soap" },
        { "foam", "foam" }, { "jelly", "jelly" }, { "paste", "paste" },
        { "paint", "paint" }, { "scrub", "scrub" }, { "gargle", "gargle" },
        { "ovule", "ovule" }, { "melt", "melt" }, { "film", "film" },
        { "ODT", "orally disintegrating tablet" }, { "MDI", "metered dose inhaler" }
    }
);

app.Run();
