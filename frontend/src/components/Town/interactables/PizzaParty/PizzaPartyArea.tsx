import { useState } from "react";
import { useInteractableAreaController } from "../../../../classes/TownController";
import PizzaPartyAreaController from "../../../../classes/interactable/PizzaPartyAreaController";
import useTownController from "../../../../hooks/useTownController";
import { GameStatus, InteractableID } from "../../../../types/CoveyTownSocket";
import PizzaPartyGame from "./PizzaPartyGame";

export default function PizzaPartyArea({interactableID} : {
  interactableID: InteractableID  
}) : JSX.Element {
  const gameAreaController = useInteractableAreaController<PizzaPartyAreaController>(interactableID);
  const townController = useTownController();

  return(
    <div>
      <h1> Pizza Party Game </h1>
      <PizzaPartyGame gameAreaController={gameAreaController} />
    </div>
  );
}