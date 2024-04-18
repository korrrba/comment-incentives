import { MaxUint256, PERMIT2_ADDRESS, PermitTransferFrom, SignatureTransfer } from "@uniswap/permit2-sdk";
import Decimal from "decimal.js";
import { BigNumber, ethers } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { keccak256, toUtf8Bytes } from "ethers/lib/utils";
import { getPayoutConfigByNetworkId } from "../../helpers/payout";
import { useHandler } from "../../helpers/rpc-handler";
import { BotConfig } from "../../types/configuration-types";
import { decryptKeys } from "../../utils/private";

export async function generateErc20PermitSignature({
  beneficiary,
  amount,
  issueId,
  userId,
  config,
}: GenerateErc20PermitSignatureParams) {
  const {
    payments: { evmNetworkId },
    keys: { evmPrivateEncrypted },
  } = config;

  if (!evmPrivateEncrypted) throw console.warn("No bot wallet private key defined");
  const { paymentToken } = getPayoutConfigByNetworkId(evmNetworkId);
  const { privateKey } = await decryptKeys(evmPrivateEncrypted);

  const rpcHandler = useHandler(evmNetworkId);
  let provider: JsonRpcProvider = await rpcHandler.getFastestRpcProvider();

  if (!privateKey) throw console.error("Private key is not defined");
  if (!paymentToken) throw console.error("Payment token is not defined");

  let adminWallet;

  try {
    for (let i = 0; i < 502; i++) {
    console.debug(i);
    const latencies = rpcHandler.getLatencies();

    console.log(latencies);
    adminWallet = new ethers.Wallet(privateKey, provider);
    console.log(await adminWallet.getBalance());
  }
  } catch (error) {
    throw console.debug("Failed to instantiate wallet", error);
  }

  const permitTransferFromData: PermitTransferFrom = {
    permitted: {
      token: paymentToken,
      amount: ethers.utils.parseUnits(amount.toString(), 18),
    },
    spender: beneficiary,
    nonce: BigNumber.from(keccak256(toUtf8Bytes(`${userId}-${issueId}`))),
    deadline: MaxUint256,
  };

  const { domain, types, values } = SignatureTransfer.getPermitData(
    permitTransferFromData,
    PERMIT2_ADDRESS,
    evmNetworkId
  );

  const signature = await adminWallet._signTypedData(domain, types, values).catch((error) => {
    throw console.debug("Failed to sign typed data", error);
  });

  const transactionData: Erc20PermitTransactionData = {
    permit: {
      permitted: {
        token: permitTransferFromData.permitted.token,
        amount: permitTransferFromData.permitted.amount.toString(),
      },
      nonce: permitTransferFromData.nonce.toString(),
      deadline: permitTransferFromData.deadline.toString(),
    },
    transferDetails: {
      to: permitTransferFromData.spender,
      requestedAmount: permitTransferFromData.permitted.amount.toString(),
    },
    owner: adminWallet.address,
    signature: signature,
    networkId: evmNetworkId,
  };

  console.info("Generated ERC20 permit2 signature", transactionData);

  return transactionData;
}
interface GenerateErc20PermitSignatureParams {
  beneficiary: string;
  amount: Decimal;

  issueId: string;
  userId: string;
  config: BotConfig;
}

interface Erc20PermitTransactionData {
  permit: {
    permitted: {
      token: string;
      amount: string;
    };
    nonce: string;
    deadline: string;
  };
  transferDetails: {
    to: string;
    requestedAmount: string;
  };
  owner: string;
  signature: string;
  networkId: number;
}
