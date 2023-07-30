import * as web3 from "@solana/web3.js";
import * as pyth from "@pythnetwork/client";

export const startPyth = async (connection: web3.Connection) => {
    
    const pythClient = new pyth.PythHttpClient(connection, pyth.getPythProgramKeyForCluster("devnet"));
    const data = await pythClient.getData();
    console.log(data)
    data.products.forEach((product, index) => {
        if (product.price_account === 'J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix') {
            
            const price = data.productPrice.get(product.symbol)!.price
            
        }
    });
    // const pythConnection = new pyth.PythConnection(
    //   connection,
    //   pyth.getPythProgramKeyForCluster("devnet")
    // );

    // pythConnection.onPriceChange((product, price) => {
    //     if (i === 0) {
    //         console.log(product)
    //         console.log(price)    
    //         i++
    //     }
        
    //     // console.log(product)
    //     if (price.price && price.confidence) {
            
    //     } else {
            
    //     }
    // });
    // pythConnection.start();
};