import { Component, createSignal, onMount, Setter } from 'solid-js';
import "../index.css"

// gonna allow stroke,color,option,eraser.
// destroy everything.. :P
export function Options(props:{color:string,setColor:Setter<string>,stroke:number,setStroke:Setter<string>}) {

  return (
    <div class="options">
        <input type="color" />
         {props.color}
    </div>
  )
};
