using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace N6
{
	public class TestHub : Hub
	{

		public async Task CreateGame(long id, string tags)
		{
			await Groups.AddToGroupAsync(Context.ConnectionId, id.ToString());
			GameManager.AddGame(id, tags.Split("\n"));
			// init X player
		}

		public async Task ConnectToGame(long id)
		{
			await Groups.AddToGroupAsync(Context.ConnectionId, id.ToString());
			// Game is CLOSED for connecting
			// init O player
		}

		public async Task MakeTurn()
		{
			// send tiles to players
			// block 1 player
			// unblock other player
		}

		public async Task CheckWin()
		{
			// send game over text
			// if game is over => delete from gameSessions
		}

		public override Task OnDisconnectedAsync(Exception exception)
		{
			// if game has no players => delete from gameSessions
			return base.OnDisconnectedAsync(exception);
		}
	}


	public static class GameManager
	{
		public static Dictionary<long, GameState> GameSessions { get; set; } = new Dictionary<long, GameState>();


		public static void AddGame(long id, string[] tags)
		{
			GameSessions.Add(id, new GameState() { Status = GameStatus.Open, Tags = tags });
		}

		public static void AddPlayerToGame()
		{

		}

		public static List<GameCommonData> GetGamesCommonData()
		{
			List<GameCommonData> games = new List<GameCommonData>();
			foreach (var game in GameSessions)
				if (game.Value.Status == GameStatus.Open)
					games.Add(new GameCommonData(){ Id = game.Key, Tags = game.Value.Tags });

			return games;
		}
	}

	public class GameState
	{
		public GameStatus Status { get; set; }
		public string[] Tags { get; set; }
		public Player[] Players { get; set; } = new Player[2];
		public string[] TileValues { get; set; } = new string[9];
	}

	public class Player
	{
		public string ConnectionId { get; set; }
		public string Symbol { get; set; }
	}

	public class GameCommonData
	{
		public long Id { get; set; }
		public string[] Tags { get; set; }
	}

	public enum GameStatus
	{
		Open,
		Closed,
		GameOver
	}
}
