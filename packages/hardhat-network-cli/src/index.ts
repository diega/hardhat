import { BN } from "ethereumjs-util";
import {
  HardhatNetworkProvider,
  ModulesLogger,
} from "hardhat/internal/hardhat-network/provider";
import { JsonRpcResponse, JsonRpcRequest } from "hardhat/types";
import * as http from "http";

function main() {
  const hardhatNetworkProvider = new HardhatNetworkProvider(
    "berlin",
    "hardhat",
    31337,
    31337,
    12450000,
    undefined,
    new BN(0),
    true,
    true,
    true,
    0,
    new ModulesLogger(true)
  );

  const httpServer = http.createServer((req, res) => {
    const chunks: any = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const data = Buffer.concat(chunks);
      const jsonRpcRequest: JsonRpcRequest = JSON.parse(data.toString("UTF-8"));
      const response: JsonRpcResponse = {
        id: jsonRpcRequest.id,
        jsonrpc: "2.0",
      };

      hardhatNetworkProvider
        .request(jsonRpcRequest)
        .then((result: any) => {
          res.writeHead(200);
          response.result = result;
        })
        .catch((error: any) => {
          if (error.code === undefined) {
            // FIXME: throw error;
            console.error(error);
          }
          response.error = {
            code: error.code ? +error.code : -1,
            message: error.message,
            data: {
              stack: error.stack,
              name: error.name,
            },
          };
        })
        .finally(() => {
          res.end(JSON.stringify(response));
        });
    });
  });
  httpServer.listen(8545, "0.0.0.0");
}

main();
