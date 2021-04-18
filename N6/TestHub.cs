using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace N6
{
	public class TestHub : Hub
	{
		public async Task Send(string message, string userName)
		{
			await Clients.All.SendAsync("Send", message, userName);
		}
	}
}
