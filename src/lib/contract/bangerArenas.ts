import type { Address, Hex } from "viem";

// Reuse the same ABI as the worker (copied here for frontend use).
export const BANGER_ARENAS_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_token", type: "address" },
      { internalType: "address", name: "_oracle", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "arenaId", type: "uint256" },
      { indexed: false, internalType: "bool", name: "outcomeYes", type: "bool" },
    ],
    name: "ArenaResolved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "arenaId", type: "uint256" },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "bool", name: "yesSide", type: "bool" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "BetPlaced",
    type: "event",
  },
  {
    inputs: [{ internalType: "uint256", name: "arenaId", type: "uint256" }],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "arenaId", type: "uint256" },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "payout", type: "uint256" },
    ],
    name: "Claimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "oldOracle", type: "address" },
      { indexed: true, internalType: "address", name: "newOracle", type: "address" },
    ],
    name: "OracleUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "oldOwner", type: "address" },
      { indexed: true, internalType: "address", name: "newOwner", type: "address" },
    ],
    name: "OwnerTransferred",
    type: "event",
  },
  {
    inputs: [
      { internalType: "uint256", name: "arenaId", type: "uint256" },
      { internalType: "bool", name: "yesSide", type: "bool" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "placeBet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "arenaId", type: "uint256" },
      { internalType: "bool", name: "outcomeYes", type: "bool" },
    ],
    name: "resolveArena",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_oracle", type: "address" }],
    name: "setOracle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "arenas",
    outputs: [
      { internalType: "uint256", name: "totalYesStake", type: "uint256" },
      { internalType: "uint256", name: "totalNoStake", type: "uint256" },
      { internalType: "bool", name: "resolved", type: "bool" },
      { internalType: "bool", name: "outcomeYes", type: "bool" },
      { internalType: "bool", name: "exists", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "address", name: "", type: "address" },
    ],
    name: "claimed",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "arenaId", type: "uint256" }],
    name: "getArena",
    outputs: [
      { internalType: "uint256", name: "totalYesStake", type: "uint256" },
      { internalType: "uint256", name: "totalNoStake", type: "uint256" },
      { internalType: "bool", name: "resolved", type: "bool" },
      { internalType: "bool", name: "outcomeYes", type: "bool" },
      { internalType: "bool", name: "exists", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "arenaId", type: "uint256" },
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "getUserStake",
    outputs: [
      { internalType: "uint256", name: "yesStake", type: "uint256" },
      { internalType: "uint256", name: "noStake", type: "uint256" },
      { internalType: "bool", name: "hasClaimed", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "oracle",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "userStake", type: "uint256" },
      { internalType: "uint256", name: "winnerTotal", type: "uint256" },
      { internalType: "uint256", name: "totalYesStake", type: "uint256" },
      { internalType: "uint256", name: "totalNoStake", type: "uint256" },
    ],
    name: "previewPayout",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "token",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "address", name: "", type: "address" },
    ],
    name: "userNoStake",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "address", name: "", type: "address" },
    ],
    name: "userYesStake",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const BANGER_ARENAS_ADDRESS = process.env
  .NEXT_PUBLIC_BANGER_ARENAS_ADDRESS as Address;

export const STAKE_TOKEN_ADDRESS = process.env
  .NEXT_PUBLIC_STAKE_TOKEN_ADDRESS as Address;

export type BangerArenasAbi = typeof BANGER_ARENAS_ABI;
export type BangerArenasAddress = typeof BANGER_ARENAS_ADDRESS;

export interface UserStakeView {
  yesStake: bigint;
  noStake: bigint;
  hasClaimed: boolean;
}


