import './App.css';
import {Component} from 'react';
import * as Tone from 'tone';
import Tonnetz from './components/Tonnetz';

const limiter = new Tone.Limiter(-12).toDestination();
const player = new Tone.PolySynth(Tone.Synth).connect(limiter);
const reverb = new Tone.Reverb(1);

player.chain(reverb, limiter, Tone.Destination);

const toneMeter = new Tone.Meter();
player.connect(toneMeter);

const toneFFT = new Tone.FFT();
player.connect(toneFFT);

const toneWaveform = new Tone.Waveform(16);
player.connect(toneWaveform);


const tonnetz = <Tonnetz width={600} height={400} player={player} Tone={Tone} follower={toneMeter} toneFFT={toneFFT}/>;


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
        {tonnetz}
      </div>
    ) 
  }
     
}

export default App;
