import { createPublicClient, createWalletClient, http, type Hex } from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

import type { Config } from "../config";


export const BANGER_ARENAS_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_token",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_oracle",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "arenaId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "outcomeYes",
				"type": "bool"
			}
		],
		"name": "ArenaResolved",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "arenaId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "yesSide",
				"type": "bool"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "BetPlaced",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "arenaId",
				"type": "uint256"
			}
		],
		"name": "claim",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "arenaId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "payout",
				"type": "uint256"
			}
		],
		"name": "Claimed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "oldOracle",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOracle",
				"type": "address"
			}
		],
		"name": "OracleUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "oldOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnerTransferred",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "arenaId",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "yesSide",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "placeBet",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "arenaId",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "outcomeYes",
				"type": "bool"
			}
		],
		"name": "resolveArena",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_oracle",
				"type": "address"
			}
		],
		"name": "setOracle",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "arenas",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "totalYesStake",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalNoStake",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "resolved",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "outcomeYes",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "exists",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "claimed",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "arenaId",
				"type": "uint256"
			}
		],
		"name": "getArena",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "totalYesStake",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalNoStake",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "resolved",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "outcomeYes",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "exists",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "arenaId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getUserStake",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "yesStake",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "noStake",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "hasClaimed",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "oracle",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "userStake",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "winnerTotal",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalYesStake",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalNoStake",
				"type": "uint256"
			}
		],
		"name": "previewPayout",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "token",
		"outputs": [
			{
				"internalType": "contract IERC20",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "userNoStake",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "userYesStake",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
] as const;

export interface BangerArenaView {
  totalYesStake: bigint;
  totalNoStake: bigint;
  resolved: boolean;
  outcomeYes: boolean;
  exists: boolean;
}

export function createPublic(config: Config) {
  return createPublicClient({
    chain: baseSepolia,
    transport: http(config.rpcUrlBaseSepolia),
  });
}

export async function getArenaView(config: Config, arenaId: number): Promise<BangerArenaView> {
  const client = createPublic(config);
  const [totalYesStake, totalNoStake, resolved, outcomeYes, exists] = (await client.readContract({
    address: config.bangerArenasAddress,
    abi: BANGER_ARENAS_ABI,
    functionName: "getArena",
    args: [BigInt(arenaId)],
  })) as [bigint, bigint, boolean, boolean, boolean];

  return { totalYesStake, totalNoStake, resolved, outcomeYes, exists };
}

export function createOracleWallet(config: Config) {
  const account = privateKeyToAccount(config.oraclePrivateKey as Hex);

  return createWalletClient({
    chain: baseSepolia,
    transport: http(config.rpcUrlBaseSepolia),
    account,
  });
}

export async function resolveArenaOnChain(
  config: Config,
  arenaId: number,
  outcomeYes: boolean,
): Promise<Hex> {
  const wallet = createOracleWallet(config);

  const hash = await wallet.writeContract({
    address: config.bangerArenasAddress,
    abi: BANGER_ARENAS_ABI,
    functionName: "resolveArena",
    args: [BigInt(arenaId), outcomeYes],
  } as any);

  return hash;
}


