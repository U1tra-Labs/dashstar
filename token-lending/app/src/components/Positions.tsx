
import InitObligation from "./InitObligation";
import React from "react";
import { Table, Form, Row, ProgressBar, Col, Card, ButtonGroup } from 'react-bootstrap';
import SupplyReserveLiquidity from "./SupplyReserveLiquidity";
import BorrowObligationLiquidity from "./BorrowObligationLiquidity";
import RepayObligationLiquidity from "./RepayObligationLiquidity";
import WithdrawObligationCollateral from "./WithdrawObligationCollateral";
import { AnchorProvider } from "@project-serum/anchor";

export default function Positions({
    reservesData,
    userData,
    callback,
    provider
} : {
    reservesData: any | undefined;
    userData: any | undefined;
    callback?: () => Promise<void>;
    provider: AnchorProvider;
}) {
    const loanRatio = userData[0] ? userData[0].data.data.borrowedValue / userData[0].data.data.allowedBorrowValue : 0
    let variant: string;
    if (loanRatio < 0.2) {
        variant = 'success'
    } else if (loanRatio < 0.7) {
        variant = 'warning'
    } else {
        variant = 'danger'
    }

    const ReserveEntry = (element: any, index: number) => {
        // *1. Need to calculate Supply and Borrow APRs
        return (
            <tr key={index}>
                <td>SOL</td>
                <td>{(element.amount/ Math.pow(10, element.decimals)).toFixed(2)}</td> 
                <td>*1</td> 
                <td>{element.lAmount.toFixed(2)}</td> 
                <td>
                    <InitObligation 
                        reserve={element}
                        callback={callback}
                    />
                </td>
                <td>
                    <ButtonGroup>
                        <SupplyReserveLiquidity
                            element={element.data}
                            provider={provider}
                            callback={callback}
                        />
                        <WithdrawObligationCollateral
                            element={element.data}
                            callback={callback}
                        />
                    </ButtonGroup>
                </td>
            </tr>
        ) 
    }

    const BorrowEntry = (element: any, index: number) => {
        // *1. Need to calculate Supply and Borrow APRs
        const reserve = reservesData.filter((reserve) => reserve.data.pubkey.toBase58() === element.borrowReserve.toBase58())
        return (
            <tr key={index}>
                <td>SOL</td>
                <td>{(element.borrowedAmountWads.toNumber() / Math.pow(10, reserve[0].decimals)).toFixed(2)}</td> 
                <td>*1</td> 
                <td>{reserve[0].lAmount.toFixed(2)}</td> 
                <td>{(Number(reserve[0].data.data.liquidity.availableAmount) / Math.pow(10, reserve[0].data.data.liquidity.mintDecimals)).toFixed(2)}</td>
                <td>
                    <ButtonGroup>
                        <BorrowObligationLiquidity
                            element={reserve[0].data}
                            callback={callback}
                        />
                        <RepayObligationLiquidity
                            borrowObligation={element}
                            reserve={reserve[0].data}
                            callback={callback}
                            provider={provider}
                        />
                    </ButtonGroup>
                </td>
            </tr>
        ) 
    }

    return(
        <div>
            <Form style={{"background":"royalBlue", "borderRadius": "10px"}} className="p-3">
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
            <Card bg='dark'>
                <Card.Header>My deposits</Card.Header>
                <Card.Body>
                    <Table hover variant='dark' className="b-1" >
                        <thead>
                            <tr>
                                <th>Asset</th>
                                <th>Supply Balance</th>
                                <th>Supply APY</th>
                                <th>Wallet</th>
                                <th>Collateral</th>
                                <th>Operation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservesData.filter((reserve: any) => reserve.amount > 0).map((d: any, index: number) => ReserveEntry(d, index))}
                        </tbody>
                    </Table>  
                </Card.Body>
            </Card>
            <br />
            <Card bg='dark'>
                <Card.Header>My borrows</Card.Header>
                <Card.Body>
                    <Table hover variant='dark' className="b-1" >
                        <thead>
                            <tr>
                                <th>Asset</th>
                                <th>Borrow Balance</th>
                                <th>Borrow APR</th>
                                <th>Wallet</th>
                                <th>Liquidity</th>
                                <th>Operation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userData[0] && userData[0].data.data.borrows.filter((borrow: any) => borrow.borrowedAmountWads > 0).map((d: any, index: number) => BorrowEntry(d, index))}
                        </tbody>
                    </Table>  
                </Card.Body>
            </Card>
        </div>  
    )
}
