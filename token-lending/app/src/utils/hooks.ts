import { useCallback, useState } from "react";
import { SendAndConfirmError } from "@holaplex/solana-web3-tools";

export const useSmartSender = () => {
  const [doneItems, setDoneItems] = useState<[number, string][]>([]);

  const progressCallback = useCallback(
    (currentIndex: number, txId: string, func = setDoneItems) => {
      func((prevState) => prevState.concat([[currentIndex, txId]]));
      console.log("Sent", txId);
    },
    []
  );

  const failureCallback = useCallback((errorObj: SendAndConfirmError) => {
    console.log(errorObj)
    console.log("Error type", errorObj.type);
    let errorMsg: string | null = null;

    if (errorObj.type === "tx-error") {
      if (typeof errorObj.inner !== "string") {
        try {
          const errorCode = (errorObj.inner as any).InstructionError[1].Custom;
          if (errorCode) {
            errorMsg = `Error Code: ${errorCode}`;
            console.log(errorMsg);
            // Can try create the mapping below if we see how patterns work

            // const progErrArray = Object.values(programErrorMap).filter(
            //   (err) => err.code === errorCode
            // );
            // const progErr = progErrArray[0];
            // if (progErr) {
            //   errorMsg = `${progErr.name}: ${progErr.msg}`;
            // } else {
            //   errorMsg = `Custom: ${errorCode}`;
            // }
          }
        } catch (newErr: any) {
          console.log("New error:", newErr);
        }
      } else {
        errorMsg = errorObj.inner;
      }
    }

    if (!errorMsg) {
      errorMsg = errorObj.type;
    }

    if (errorObj.txid) {
      console.log("Error txId:", errorObj.txid);
    }

    throw new Error(errorMsg);
  }, []);

  return {
    doneItems,
    setDoneItems,
    failureCallback,
    progressCallback,
  };
};
