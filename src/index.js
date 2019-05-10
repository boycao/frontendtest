import React from "react";
import ReactDOM from "react-dom";
import {Button, Navbar, Form,FormControl} from 'react-bootstrap';
import {UncontrolledCollapse, Badge, Spinner, Card} from 'reactstrap';

import "./index.css";


function BlockSummary(props) {
    
        return(
            <div className="block-summary">
                <h2>Summary</h2>
                <table className="block-summary-table">
                    <tbody>
                        <tr>
                            <td><b>Hash:</b></td>
                            <td>{props.data.hash}</td>
                        </tr>
                        <tr>
                            <td><b>Bits:</b></td>
                            <td>{props.data.bits}</td>
                        </tr>
                        <tr>
                            <td><b>Size:</b></td>
                            <td>{props.data.size/1000} kB</td>
                        </tr>
                        <tr>
                            <td><b>Prev Block:</b></td>
                            <td>{props.data.prev_block}</td>
                        </tr>
                        <tr>
                            <td><b>Prev Block:</b></td>
                            <td>{props.data.next_block}</td>
                        </tr>
                        <tr>
                            <td><b>Merkle Root:</b></td>
                            <td>{props.data.mrkl_root}</td>
                        </tr>
                        <tr>
                            <td><b>Time:</b></td>
                            <td>{props.data.time}</td>
                        </tr>
                        <tr>
                            <td><b>Nonce:</b></td>
                            <td>{props.data.nonce}</td>
                        </tr>
                        <tr>
                            <td><b>Transactions:</b></td>
                            <td>{props.data.n_tx}</td>
                        </tr>
                    </tbody>
                 </table>
            </div>
            );   
}
function TransactionDetails(props){
    return (
        <Card>
            <div className="arrow-head"></div>
            <ul>
                <h4>Transaction</h4>
                <li><b>Hash:</b>
                    <span className="small-text">{props.details.hash}</span>
                </li>
                <li><b>Size:</b>
                    {props.details.size/1000} kB
                </li>
            </ul>
        </Card>
    );
}

function TransactionIn(props){
    const in_tx = props.details.in.map((tx_d, index) => {
        const scriptSignature = tx_d.scriptSig ? tx_d.scriptSig : 'coinbase';
        return (
                <li key={scriptSignature + '_' + index}>
                    <b>Script Signature:</b><span className="small-text">{scriptSignature} </span> 
                </li>
        )
    });

    return (
        <ul>
            <h4>Input</h4>
            <li>
                <ol>
                    {in_tx}
                </ol>
            </li>
        </ul>
    );
}


function TransactionOut(props){
    
    const out_tx_total = props.details.out.reduce((total, tx_d) => {
        let current = parseFloat(tx_d.value);
       return total + current;        
    },0);

    const out_tx = props.details.out.map((tx_d, index) => {
        
        let pubKey_ar = tx_d.scriptPubKey.split(" ");
        let address = tx_d.scriptPubKey;
        pubKey_ar.forEach(element => {
            
            if(element.indexOf('OP_') === -1){
                address = element;
            }
        });
        return (
            
                <li key={tx_d.scriptPubKey + '_' + index}>
                    <span className="sub-btc-badge" color="success">BCT {tx_d.value}</span>
                    {address}
                </li>
            
        )
    });

    return (
        <ul>
            <h4>Out <Badge className="btc-badge" color="success">Total BCT {out_tx_total}</Badge></h4>
            <li>
                <ol>
                    {out_tx}
                </ol> 
            </li>
        </ul>
    );
}

function BlockTransactions(props){
    const txns = props.data.tx.map((d) => {
        return (
            <tr key={d.hash}>
                <td className="transcation-details">
                    <TransactionIn details={d}/>
                </td>
                <td className="transcation-details">
                    <TransactionDetails details={d}/>
                </td>
                <td className="transcation-details">
                    <TransactionOut details={d}/>
                </td>
            </tr>
            
        )
    });
    
    return(
        <div className="block-txns">

            <Button className="collapser" id="toggler" style={{ marginBottom: '1rem' }}>
                <h2>Transactions</h2>
            </Button>
            <UncontrolledCollapse toggler="#toggler">
                <table className="block-txns-table">
                    <tbody>
                        {txns}
                    </tbody>
                </table>
            </UncontrolledCollapse>
            
        </div>
        );  
}

class BlockAPI extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
                    value: '000000000000000001806a922d4d35a37ad9324c690f72d556c6445cb7a9c214',
                    blockData: {},
                    loading: false
        };
    
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleResponse = this.handleResponse.bind(this);
        
      }
    
      handleChange(event) {
        this.setState({value: event.target.value});
      }

      showError(msg){
          alert(msg);
      }

      handleResponse(error, response, body){
        this.setState({loading : false});
     
        if(undefined !== response){

            let extractedBlockData = JSON.parse(response.body);
            
            if( undefined !== extractedBlockData.error){
                this.showError(extractedBlockData.error)
                return;
            }

            //date
            let date = new Date(1000*extractedBlockData.time);
            extractedBlockData.time = date.toUTCString();
    
            this.setState({blockData : extractedBlockData});
        }
        else{
            this.showError(error);
        }
        
      }
    
      handleSubmit(event) {
        const httpRequest = require('request');
        this.setState({loading : true});
        
        //Note: cors-anywhere.herokuapp.com API enables cross-origin requests to anywhere.
        httpRequest('https://cors-anywhere.herokuapp.com/https://webbtc.com/block/'+this.state.value+'.json', (error, response, body) => this.handleResponse(error, response, body))
       
        event.preventDefault();
      }

      renderBlockSummary(){
        
          if( !objectIsEmpty(this.state.blockData))
          {
              return (<BlockSummary 
                        data={this.state.blockData}
                        />);
            }
            else{
                return(
                    <div>
                        <h3 className="landing-msg">Search a hash code to see the Block's summary &amp; transactions.</h3>
                        <img alt="blockchain icon" className="center banner-img rotate" src="blockchain.png"/>
                    </div>
                );
            }
            
      }

      renderBlockTransactions(){
        
        if( !objectIsEmpty(this.state.blockData))
        {
            return (<BlockTransactions
                      data={this.state.blockData}
                      />);
          }
    }


    renderSpinner(loading){
        if(loading){
            return (<Spinner className="search-spinner" size="md" color="primary" />);
        }
    }

    renderFooter(){
        return (
            <footer>
                Made by Boya :)
            </footer>
        );
    }
    
      render() {
        return (
            <div>
                <Navbar bg="light" expand="lg" fixed="top">
                    <Navbar.Brand>Bitcoin Surfer</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Form inline onSubmit={this.handleSubmit}>
                            <FormControl type="text" placeholder="Search" className="mr-sm-2 big" value={this.state.value} onChange={this.handleChange} />
                            <Button variant="outline-primary" type="submit"  >Search Block</Button>
                            {this.renderSpinner(this.state.loading)}
                        </Form>
                    </Navbar.Collapse>
                </Navbar>
                <div className="block-app">
                    {this.renderBlockSummary()}
                    {this.renderBlockTransactions()}
                </div>
            </div>
        );
      }
  }

ReactDOM.render(<BlockAPI />, document.getElementById("root"));

function objectIsEmpty(obj){
    return Object.keys(obj).length === 0;
  }