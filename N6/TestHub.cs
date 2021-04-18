using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace N6
{
	public class TestHub : Hub
	{
		private int turn = 0;
		public async Task OnTileClick(string tileId)
		{
			bool isXTurn = (turn % 2 == 1);
			string symbol = isXTurn ? "X" : "O";
			await Clients.All.SendAsync("SendTurn", tileId, symbol);
		}
	}
}
