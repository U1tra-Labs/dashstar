import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import React from "react";
import { useEffect, useState } from "react";
import { Table, Form, ButtonGroup, Row, Col, ProgressBar } from 'react-bootstrap';
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import { AnchorProvider } from "@project-serum/anchor";
import SupplyReserveLiquidity from "./SupplyReserveLiquidity";
import BorrowObligationLiquidity from "./BorrowObligationLiquidity";
import { WRAPPED_SOL } from "../utils/constants";

export default function Reserves({
    reservesData,
    userData,
    provider,
    callback
} : {
    reservesData: any;
    userData: any;
    provider: AnchorProvider | undefined;
    callback?: () => Promise<void>;
}) {
    const wallet = useAnchorWallet();
    const { connection } = useConnection();
    const data: any = reservesData.map((reserve: any) => reserve.data)
    let loanRatio;
    try {
        loanRatio = userData[0].data.data.borrowedValue / userData[0].data.data.allowedBorrowValue
    } catch (e) {
        loanRatio = 0.5
    }
    let variant: string;
    if (loanRatio < 0.2) {
        variant = 'success'
    } else if (loanRatio < 0.7) {
        variant = 'warning'
    } else {
        variant = 'danger'
    }
    const ReserveEntry = (element: any, index: number) => {
        const [info, setInfo] = useState<number | undefined>(undefined)
        
        useEffect(() => {
            // const mintInfo = getMint(connection, element.data.liquidity.mintPubkey);
            if (element.data.liquidity.mintPubkey.toBase58() === WRAPPED_SOL) {
                Promise.resolve(connection.getBalance(wallet?.publicKey!)
                    .then((res) => setInfo(res / LAMPORTS_PER_SOL))
                );
            } else {
                const userAta = getAssociatedTokenAddress(element.data.liquidity.mintPubkey, wallet?.publicKey!)
                Promise.resolve(userAta).then((res) => {    
                    const ataInfo = getAccount(connection, res)
                    Promise.resolve(ataInfo).then((info) => setInfo(Number(info.amount) / Math.pow(10, element.data.liquidity.mintDecimals)))
                        .catch(() => setInfo(0))
                });
            }     
        }, [index])
        
        // *1. Need to calculate Supply and Borrow APRs
        // *2 Need to read connected wallet to get amount held by user in this market 
        // *3 Need a better way to get the mint decimals - this seems to be slow and calling multiple times
        if (info !== undefined) {
            return (
                <tr key={index}>
                    <td>SOL</td>
                    <td>*1</td> 
                    <td>*1</td> 
                    <td>{info.toFixed(2)}</td> 
                    <td>{(Number(element.data.liquidity.availableAmount) / Math.pow(10, element.data.liquidity.mintDecimals)).toFixed(2)}</td>
                    <td>
                        <ButtonGroup>
                        <SupplyReserveLiquidity
                                element={element}
                                provider={provider}
                                callback={callback}
                            />
                            <BorrowObligationLiquidity
                                element={element}
                                callback={callback}
                            />
                        </ButtonGroup>
                        
                    </td>
                </tr>
            )
        }
    }

    return(
        <div>
            <Form  style={{"background":"royalBlue", "borderRadius": "10px"}} className="p-3">
                <Row className="mb-3">
                    <Form.Group as={Col} controlId="deposits">    
                        <Form.Label>Value of deposits</Form.Label>
                        <Form.Control readOnly className="text-center"
                            defaultValue={`$${userData[0] ? userData[0].data.data.depositedValue.toFixed(2) : 0}`} 
                        />
                    </Form.Group>
                    <Form.Group as={Col} controlId="borrowedValue">
                        <Form.Label>Borrowed Value</Form.Label>
                        <Form.Control readOnly className="text-center"
                            defaultValue={`$${userData[0] ? userData[0].data.data.borrowedValue.toFixed(2) : 0}`}
                        />
                    </Form.Group>

                </Row>
            
                <Row className="mb-3">
                    <Form.Group as={Col} controlId="allowedBorrowValue">    
                        <Form.Label>Allowed Borrow Value</Form.Label>
                        <Form.Control readOnly className="text-center"
                            defaultValue={`$${userData[0] ? userData[0].data.data.allowedBorrowValue.toFixed(2) : 0}`} 
                        />
                    </Form.Group>
                    
                    <Form.Group as={Col} controlId="liquidationThreshold">
                        <Form.Label>Liquidation Threshold</Form.Label>
                        <Form.Control readOnly className="text-center"
                            defaultValue={`$${userData[0] ? userData[0].data.data.unhealthyBorrowValue.toFixed(2) : 0}`}
                        />
                    </Form.Group>
                </Row>
                <Row className="m-1">
                    <Form.Label>Loan health score</Form.Label>
                    <ProgressBar 
                        now={loanRatio * 100} 
                        variant={variant} label={`${(loanRatio * 100).toFixed(0)}%`}
                    />
                </Row>
            </Form>
            
            <br />
            <Table hover variant='dark' className="b-1" >
                <thead>
                    <tr>
                        <th>Asset</th>
                        <th>Supply APR</th>
                        <th>Borrow APR</th>
                        <th>Wallet</th>
                        <th>Liquidity</th>
                        <th>Operation</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((d, index) => ReserveEntry(d, index))}
                </tbody>
            </Table>
        </div>
    
    
        
    )
}

