import './App.css';
import {Component} from 'react';
import * as Tone from 'tone';
import Tonnetz from './components/Tonnetz';

const player = new Tone.FMSynth().toDestination();
const tonnetz = <Tonnetz width={600} height={400} player={player} Tone={Tone}/>;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
        tonnetz: tonnetz,
        player: player
    }
  }

  componentDidMount() {
    const loop = new Tone.Loop(time => {
      this.state.player.triggerAttackRelease(200+Math.random()*880, "8n",time);
      console.log("PLAY");
    }, "2n");

    document.getElementById('sound-on')?.addEventListener('click', async () => {
      await Tone.start()
      loop.start(0);
      console.log('audio is ready')
    });

    document.getElementById('sound-off')?.addEventListener('click', async () => {
      loop.stop();
      console.log('audio is off')
    });

    Tone.Transport.start();
  }

  soundOn = () => {
    Tone.start();
	  console.log('audio is ready');
  }

  render() {
    return (
      <div id="App">
        {this.state.tonnetz}
        {/* <button id={'sound-on'}>SOUND ON</button>
        <button id={'sound-off'}>SOUND OFF</button> */}
      </div>
    ) 
  }
     
}

export default App;
