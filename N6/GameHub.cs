using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace N6
{
	public class GameHub : Hub
	{
		public async Task ReceiveMessage(string message, IClientProxy clients)
		{
			await clients.SendAsync("ReceiveMessage", message);
		}


		public async Task CreateGame(string gameId, string tags)
		{
			await Groups.AddToGroupAsync(Context.ConnectionId, gameId);

			
			GameManager.AddGame(gameId, tags.Split("\n"));
			await ReceiveMessage($"{gameId} CreateGame", Clients.Group(gameId));
			InitPlayer(gameId, Context.ConnectionId, GameSymbol.X);
		}

		public async Task ConnectToGame(string gameId)
		{
			if (GameManager.Sessions[gameId].Status != GameStatus.Open) throw new HubException($"{gameId} game isn't open to connect");

			await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
			await ReceiveMessage($"{gameId} ConnectToGame", Clients.Group(gameId));
			InitPlayer(gameId, Context.ConnectionId, GameSymbol.O);

			await ReceiveTileValues(gameId, GameManager.Sessions[gameId].TileValues);
		}

		public async Task InitPlayer(string gameId, string connectionId, GameSymbol symbol)
		{
			Player[] players = GameManager.Sessions[gameId].Players;

			if (players[(int)symbol] != null) throw new HubException($"Player {symbol} in {gameId} game has been taken yet");

			players[(int)symbol] = new Player() { ConnectionId = connectionId, Symbol = symbol };
			await Clients.Caller.SendAsync("ReceiveYourSymbol", players[(int)symbol].Symbol.ToString());

			if (GameManager.Sessions[gameId].Players[0] != null && GameManager.Sessions[gameId].Players[1] != null)
				GameManager.Sessions[gameId].Status = GameStatus.Closed;
		}

		public async Task HandlePlayerTurn(string gameId, int tyleId)
		{
			await ReceiveMessage($"{gameId} || {Context.ConnectionId} кликнул по {tyleId}", Clients.Group(gameId));

			GameState game = GameManager.Sessions[gameId];
			GameSymbol playerSymbol = Array.Find(game.Players, player => player != null && player.ConnectionId.Equals(Context.ConnectionId)).Symbol;

			if (playerSymbol != GetWhoseTurn(game)) return;

			game.TileValues[tyleId] = playerSymbol.ToString();
			await ReceiveTileValues(gameId, game.TileValues);

			await CheckWinConditions(gameId);
		}

		private GameSymbol GetWhoseTurn(GameState game)
		{
			int turn = game.TileValues.Count(s => s != null);
			if (turn % 2 == 0)
				return GameSymbol.X;
			else
				return GameSymbol.O;
		}

		public async Task ReceiveTileValues(string gameId, string[] tileValues)
		{
			await Clients.Group(gameId).SendAsync("ReceiveTileValues", tileValues);
		}

		public async Task CheckWinConditions(string gameId)
		{
			string[] tiles = GameManager.Sessions[gameId].TileValues;

			await CheckTilesWinConditions(gameId, tiles, 0, 1, 2);
			await CheckTilesWinConditions(gameId, tiles, 3, 4, 5);
			await CheckTilesWinConditions(gameId, tiles, 6, 7, 8);
			await CheckTilesWinConditions(gameId, tiles, 0, 3, 6);
			await CheckTilesWinConditions(gameId, tiles, 1, 4, 7);
			await CheckTilesWinConditions(gameId, tiles, 2, 5, 8);
			await CheckTilesWinConditions(gameId, tiles, 0, 4, 8);
			await CheckTilesWinConditions(gameId, tiles, 2, 4, 6);
			if (tiles.Count(s => s != null) >= 9) await ReceiveGameOver(gameId, $"Tie Game!");
		}

		private async Task CheckTilesWinConditions(string gameId, string[] tiles, int t1, int t2, int t3)
		{
			if (tiles[t1] != null && tiles[t1] == tiles[t2] && tiles[t2] == tiles[t3]) await ReceiveGameOver(gameId, $"{tiles[t1]} Wins!", t1, t2, t3);
		}

		public async Task ReceiveGameOver(string gameId, string message, params int[] winTiles)
		{
			await Clients.Group(gameId).SendAsync("ReceiveGameOver", message, winTiles);
			GameManager.Sessions.Remove(gameId);
		}

		public override Task OnDisconnectedAsync(Exception exception)
		{
			// if game has no players => delete from gameSessions
			return base.OnDisconnectedAsync(exception);
		}
	}


	public static class GameManager
	{
		public static Dictionary<string, GameState> Sessions { get; set; } = new Dictionary<string, GameState>();


		public static void AddGame(string id, string[] tags)
		{
			Sessions.Add(id, new GameState() { Status = GameStatus.Open, Tags = tags });
		}

		public static void AddPlayerToGame()
		{

		}

		public static List<GameCommonData> GetGamesCommonData()
		{
			List<GameCommonData> games = new List<GameCommonData>();
			foreach (var game in Sessions)
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
		public GameSymbol Symbol { get; set; }
	}

	public class GameCommonData
	{
		public string Id { get; set; }
		public string[] Tags { get; set; }
	}

	public enum GameStatus
	{
		Open,
		Closed,
		GameOver
	}

	public enum GameSymbol
	{
		X,
		O
	}
}
