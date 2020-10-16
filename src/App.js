import React, {useState} from 'react';
import './App.css';

const initialState = {locked: false, started: false, activePlayer: -1, players: [{ name: 'Player 1', time: 15000}, {name: 'Player 2', time: 15000}]};

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
        let activePlayer = this.state.activePlayer;
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
    }, 70);
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
          locked={this.state.locked}
          onSetTime={(newTime) => {
            this.setState({...this.state, players: this.state.players.map((p, index) => index === idx ? { ...p, time: newTime } : p)})
          }} 
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
        <button className='stopButton' onClick={() => this.setState({...this.state, started: false, activePlayer: -1})}>stop</button>
        <button className='resetButton'onClick={() => this.setState({...this.state, started: false, activePlayer: -1, players: this.state.players.map(p => { p.time = 15000; return p; })})}>reset</button>
        <button className='lockButton'onClick={() => this.setState({...this.state, locked: !this.state.locked})}>{this.state.locked ? 'unlock' : 'lock'}</button>
      </div>
    );
  }
}

function time(ms){
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  let milliseconds = (ms - (seconds * 1000));
  seconds = (seconds - (minutes * 60));
  let minuteStr = minutes.toString().length < 2 ? `0${minutes}` : minutes;
  let secondStr = seconds.toString().length < 2 ? `0${seconds}` : seconds;
  let millisecondStr = milliseconds.toString().length < 2 ? `0${milliseconds}` : milliseconds.toString().slice(0, 2);
  return { minutes, seconds, milliseconds, string: `${minuteStr}:${secondStr}:${millisecondStr}`, totalMs: ms}
}

class Timer {
  constructor(ms){
    let t = time(ms);
    this._minutes = t.minutes;
    this._seconds = t.seconds;
    this._milliseconds = t.milliseconds;
    this._count = t.totalMs;
    this._string = t.string;
  }
  get minutes() {
    return this._minutes;
  }
  get seconds() {
    return this._seconds;
  }
  get milliseconds() {
    return this._milliseconds;
  }
  get count() {
    return this._count;
  }
  toString() {
    return this._string;
  }

  set minutes(v) {
    let diff = v - this.minutes;
    this._count += (diff * 60000);
    this._minutes = v;
    return this;
  }
  set second(v) {
    let diff = v - this.seconds;
    this._count += (diff * 60);
    this._seconds = v;
    return this;
  }
  set millisecond(v){
    let diff = v - this.milliseconds;
    this._count += diff;
    this._milliseconds = v;
    return this;
  }
  set count(v){
    let t = time(v);
    this._minutes = t.minutes;
    this._seconds = t.seconds;
    this._milliseconds = t.milliseconds;
    this._count = t.totalMs;
    this._string = t.string;  
    return this;
  }
}

function Player(props) {
  let [timePopup, setTimePopup] = useState(false);
  return (<div onClick={() => {if(timePopup) return; props.onTakeTurn()}} className={`player ${props.active ? 'active-player' : 'inactive-player'}`}>
    <div className="playerName" >
      <span onClick={(e)=>{
        if(props.locked) return;
        e.stopPropagation();
        let newName = window.prompt('enter name');
        newName = newName ? (newName.match(/\w+/) ? newName :  props.name) : props.name;
        props.onNameChange(newName);
      }}>{props.name}</span>
    </div>
    <div onClick={e => {if(props.locked) return; e.stopPropagation()}} className="playerTime">
      {timePopup ? <TimeForm time={new Timer(props.time)} onSetTime={time => {setTimePopup(false);props.onSetTime(time)}}></TimeForm>: <span>{time(props.time).string}</span>}
      <button onClick={e => {
        if(props.locked) return;
        e.stopPropagation();
        setTimePopup(!timePopup);
      }}>{timePopup ? 'cancel' : 'set time'}</button>
    </div>
  </div>)
}

function TimeForm(props) {
  let [time, setTime] = useState(props.time);
  return (
    <form 
      onClick={e => e.stopPropagation()} 
      onSubmit={e => {
        e.preventDefault();
        props.onSetTime(time.count);
      }
    }>
      <input onChange={e => {time.minutes = e.target.value; setTime(time)}} placeholder={time.minutes} type="number"></input>
      :
      <input onChange={e => {time.minutes = e.target.value; setTime(time)}} placeholder={time.seconds} type="number"></input>
      :
      <input onChange={e => {time.minutes = e.target.value; setTime(time)}} placeholder={time.milliseconds} type="number"></input>
      <button>submit</button>
    </form>
  )
}


export default App;
