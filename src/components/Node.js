//not the kind of node.js you 
//are probably thinking of
import {Component} from 'react';

class Node extends Component {
    constructor(props) {
        super(props);
        this.state = {
            generator: this.props.generator,
            period: this.props.period,
            size: 10
        };
        this.screenPosition = {
            x: this.props.center.x + this.props.width * (2*this.props.generator + this.props.period),
            y: this.props.center.y + Math.sqrt(3) * this.props.width * this.props.period
        };
        this.getFreq = this.getFreq.bind(this);
    }

    play = () => {
        this.props.player.triggerAttackRelease(this.props.getFreq(), "8n");
    }

    drawNode = (p5) => {
        p5.ellipse(0,0,15,15);
    }
}

export default Node