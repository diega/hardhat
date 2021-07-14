import { BN } from "ethereumjs-util";
import { HardhatNetworkProvider } from "hardhat-network-core";
import { ModulesLogger } from "hardhat-network-core";
import { JsonRpcResponse, JsonRpcRequest } from "hardhat-types";
import * as http from "http"

function main() {
  let hardhatNetworkProvider = new HardhatNetworkProvider(
    "berlin",
    "hardhat",
    31337,
    31337,
    12450000,
    new BN(0),
    true,
    true,
    true,
    0,
    new ModulesLogger(true),
  )

  let httpServer = http.createServer((req, res) => {
    let chunks:any = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const data = Buffer.concat(chunks);
      let jsonRpcRequest: JsonRpcRequest = JSON.parse(data.toString("UTF-8"));
      const response: JsonRpcResponse = {
        id: jsonRpcRequest.id,
        jsonrpc: "2.0",
      };

      hardhatNetworkProvider.request(jsonRpcRequest).then((result) => {
        res.writeHead(200);
        response.result = result;
      }).catch((error) => {
        if (error.code === undefined) {
          throw error;
        }

        response.error = {
          code: error.code ? +error.code : -1,
          message: error.message,
          data: {
            stack: error.stack,
            name: error.name,
          },
        };
      }).finally(() => {
          res.end(JSON.stringify(response))
        }
      );
    });
  });
  httpServer.listen(8545, "0.0.0.0");
}

main();
