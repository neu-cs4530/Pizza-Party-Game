import PizzaPartyAreaController from '../../../../classes/interactable/PizzaPartyAreaController';
import Interactable from './Interactable';


export default class PizzaPartyScene extends Phaser.Scene {
  private _pendingOverlapExits = new Map<Interactable, () => void>();


  public pizzaPartyController: PizzaPartyAreaController;

  constructor(pizzaPartyController: PizzaPartyAreaController, resourcePathPrefix = '') {
    super('pizzaPartyGame');
    this._resourcePathPrefix = resourcePathPrefix;
    this.pizzaPartyController = pizzaPartyController;
    this._players = this.coveyTownController.players;
  }

  preload(): void {
    this.load.image('pizzaBase', '/assets/pizza-party/raw-pizzas/dough.png');
  }

  create() {
    // Add background
    this.add.image(0, 0, 'background').setOrigin(0);

    // Create pizza base
    const pizzaBase = this.add.image(400, 300, 'pizzaBase');

    // Create toppings as draggable sprites
    const toppings = this.physics.add.group({
      key: 'topping',
      repeat: 5, // Example: Create 5 toppings
      setXY: { x: 200, y: 100, stepX: 80 }
    });
    toppings.children.iterate(topping => {
      topping.setInteractive({ draggable: true });
      this.input.setDraggable(topping);
    });

    // Create customers
    const customers = this.physics.add.group();
    const customer = customers.create(100, 100, 'customer');
    customer.setBounce(1, 1);
    customer.setVelocity(Phaser.Math.Between(-200, 200), Phaser.Math.Between(-200, 200));

    // Handle mouse interaction to move toppings to pizza
    this.input.on('dragstart', (pointer, topping) => {
      // Example: Start dragging topping
    });

    this.input.on('drag', (pointer, topping, dragX, dragY) => {
      // Example: Move topping with the mouse
      topping.x = dragX;
      topping.y = dragY;
    });

    this.input.on('dragend', (pointer, topping) => {
      // Example: Drop topping on pizza
      if (Phaser.Geom.Rectangle.Overlaps(topping.getBounds(), pizzaBase.getBounds())) {
        // Add topping to pizza
        // Example: pizzaBase.addTopping(topping);
      }
    });

    // Set up oven
    const oven = this.physics.add.image(600, 300, 'oven');
    oven.setInteractive();

    // Handle oven interaction
    oven.on('pointerdown', () => {
      // Example: Put pizza in oven
      // Example: oven.putPizza(pizzaBase);
    });

    // Set up submit order functionality
    // Example:
    // submitOrderButton.on('pointerdown', () => {
    //   // Example: Submit order to customer
    //   // Example: customer.submitOrder(pizzaBase);
    //   // Example: Remove customer from scene
    //   // Example: customer.destroy();
    // });
  }
}