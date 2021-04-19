using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace N6
{
	public class Startup
	{
		public void ConfigureServices(IServiceCollection services)
		{
			services.AddSignalR();
		}

		public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
		{
			if (env.IsDevelopment())
			{
				app.UseDeveloperExceptionPage();
			}

			app.UseFileServer();
			app.UseRouting();

			app.UseEndpoints(endpoints =>
			{
				endpoints.MapHub<GameHub>("/hub");
				endpoints.MapGet("/getgameslist", async context =>
				{
					string jsonText = System.Text.Json.JsonSerializer.Serialize(GameManager.GetGamesCommonData());
					await context.Response.WriteAsync(jsonText);
				});
			});
		}
	}
}
