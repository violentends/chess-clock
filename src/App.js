import React from 'react';
import './App.css';

const initialState = {started: false, activePlayer: -1, players: [{ name: 'Player 1', time: 15000}, {name: 'Player 2', time: 15000}]};

class App extends React.Component {
  constructor(){
    super();
    this.state = {...initialState, players: [...initialState.players]};
  }
  componentDidMount(){
    this.interval = setInterval(() => {
      if(this.state.started){
        let elapsedTime = Date.now() - this.state.currentTime;
        let started = this.state.started;
        let activePlayer = this.state.activePlayer
        let newPlayers = this.state.players.map((p, idx) =>{
          let player = {...p}
          if(idx === this.state.activePlayer){
            player.time -= elapsedTime;
            if(player.time <= 0) {
              player.time = 0;
              started = false;
              activePlayer = -1;
            }
          }
          return player;
        })
        this.setState({...this.state, activePlayer, started, players: newPlayers, currentTime: Date.now()});
      }
    }, 50);
  }
  componentWillUnmount(){
    clearInterval(this.interval);
  }
  render () {
    return (
      <div className="layout">
        {this.state.players.map((p, idx) => <Player 
          key={idx} 
          active={idx === this.state.activePlayer} 
          onTakeTurn={() => {
            let newState = {};
            if(!this.state.started) {
              newState.started = true;
            }
            newState.currentTime = Date.now();
            newState.activePlayer = idx;
            this.setState({...this.state, ...newState})
          }}
          onNameChange={(newName)=>{
            this.setState({...this.state, players: this.state.players.map((v, index) => index === idx ? {...v, name: newName} : v)})
          }} 
          name={p.name}
          time={p.time} 
        />)}
        <button onClick={() => this.setState({...this.state, started: false, activePlayer: -1})}>stop</button>
        <button onClick={() => this.setState({...this.state, started: false, activePlayer: -1, players: this.state.players.map(p => { p.time = 15000; return p; })})}>reset</button>
      </div>
    );
  }
}

class Player extends React.Component {
  render () {
    let props = this.props;
    return (<div onClick={props.onTakeTurn} className={`player ${this.props.active ? 'active-player' : 'inactive-player'}`}>
      <div className="playerName" >
        <span onClick={(e)=>{
          e.stopPropagation()
          let newName = window.prompt('enter name')
          props.onNameChange(newName)
        }}>{props.name}</span>
      </div>
      <div className="playerTime">
        <span>{props.time}</span>
        <button onClick={e => e.stopPropagation()}>set time</button>
      </div>
    </div>)
  }
}


export default App;
