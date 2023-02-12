import { Setter } from 'solid-js';
import { LargeIcon } from '../assets/images/large';
import { MediumIcon } from '../assets/images/medium';
import { SmallIcon } from '../assets/images/small';
import "../index.css"

const stroke = {
  SMALL : 5,
  MEDIUM : 10,
  LARGE : 15
}

// gonna allow stroke,color,option,eraser.
// destroy everything.. :P
export function Options(props: { color: string, setColor: Setter<string>, stroke: number, setStroke: Setter<string> }) {

  const handleStrokWidthChange = (e: any) => {
    props.setStroke(e.target.value)
  }

  return (
    <div class="options">
      <label for="color">Color</label> <br />
      <span>
        <input id="color" type="color" value={props.color} onChange={(e) => { props.setColor(e.currentTarget.value) }} />
        <p>{props.color}</p>
      </span>
      <label for="color">Stroke</label> <br />
      <span class="group" onChange={handleStrokWidthChange}>
        <label>
        <input type="radio" name="test" value={stroke.SMALL} checked />
        <span class="icon"><SmallIcon /></span>
        </label>
        <label>
        <input type="radio" name="test" value={stroke.MEDIUM}  />
        <span class="icon"><MediumIcon /></span>
        </label>
        <label>
        <input type="radio" name="test" value={stroke.LARGE} />
        <span class="icon"><LargeIcon /></span>
        </label>
      </span>
    </div>
  )
};
