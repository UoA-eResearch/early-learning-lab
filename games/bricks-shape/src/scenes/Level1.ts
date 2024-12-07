import { BaseBricksScene } from "./BaseBricksScene.ts";
import {
  AQUA,
  BLACK,
  BUILD_AREA_LEFT,
  BUILD_AREA_TOP,
  FUSCHIA,
  HALF_WIDTH,
  LIME,
  ORANGE,
  RED,
  TARGET_LEFT,
  TARGET_TOP,
  TILE_SIZE,
  YELLOW,
} from "../constants.ts";
import Pointer = Phaser.Input.Pointer;
import Zone = Phaser.GameObjects.Zone;
import { renderText } from "../banners.ts";

export class Level1 extends BaseBricksScene {
  private readonly rows = 2;
  private readonly cols = 3;
  private colours = [FUSCHIA, AQUA, LIME, YELLOW, RED, ORANGE];
  private buildTileXOffsets = [
    TILE_SIZE,
    2 * TILE_SIZE,
    3 * TILE_SIZE,
    4 * TILE_SIZE,
    5 * TILE_SIZE,
    6 * TILE_SIZE,
  ];
  private buildTileYOffsets = [10, 20, 30, 40, 50, 60];
  private allTiles: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super(
      "Level1",
      '"Bricks Shape" - Level 1',
      "Player A build the target shape!",
      "MainMenu",
      "Level2",
    );
  }

  init() {
    this.resetTileSeedData();
  }

  create() {
    super.create();
    const BORDER = 4;
    const tileBoxes = this.add.graphics({
      lineStyle: {
        width: BORDER,
        color: BLACK,
      },
    });
    tileBoxes.strokeRect(
      TARGET_LEFT - BORDER / 2,
      TARGET_TOP - BORDER / 2,
      this.cols * TILE_SIZE + BORDER,
      this.rows * TILE_SIZE + BORDER,
    );
    tileBoxes.strokeRect(
      BUILD_AREA_LEFT - BORDER / 2,
      BUILD_AREA_TOP - BORDER / 2,
      this.cols * TILE_SIZE + BORDER,
      this.rows * TILE_SIZE + BORDER,
    );
    for (let tileIndex = 1; tileIndex <= this.rows * this.cols; tileIndex++) {
      // Create a texture for each tile, so we can use it to create sprites
      const colour = this.colours[tileIndex - 1];
      this.add
        .graphics({
          fillStyle: {
            color: colour,
          },
        })
        .setVisible(false)
        .fillRect(0, 0, TILE_SIZE, TILE_SIZE)
        .generateTexture("" + colour, TILE_SIZE, TILE_SIZE);
    }

    const resetButton = this.add.graphics();
    resetButton.lineStyle(2, BLACK);
    resetButton.fillStyle(ORANGE);

    const resetLeft = HALF_WIDTH - 75;
    const resetTop = TARGET_TOP - 70;
    resetButton.fillRoundedRect(resetLeft, resetTop, 100, 50, 5);
    resetButton.strokeRoundedRect(resetLeft, resetTop, 100, 50, 5);
    renderText(this, resetLeft + 50, resetTop + 8, "Reset");

    resetButton.setInteractive(
      new Phaser.Geom.Rectangle(resetLeft, resetTop, 100, 50),
      Phaser.Geom.Rectangle.Contains,
    );

    resetButton.on("pointerdown", () => {
      this.doReset();
    });

    this.resetTiles();
  }

  protected doReset(): void {
    this.resetTiles();
  }

  private resetTileSeedData() {
    Phaser.Utils.Array.Shuffle(this.colours);
    Phaser.Utils.Array.Shuffle(this.buildTileXOffsets);
    Phaser.Utils.Array.Shuffle(this.buildTileYOffsets);
  }

  private resetTiles() {
    this.resetTileSeedData();
    this.removeExistingTiles();
    for (let tileIndex = 1; tileIndex <= this.rows * this.cols; tileIndex++) {
      const colour = this.colours[tileIndex - 1];

      // Target tile
      const targetTile = this.add
        .sprite(
          TARGET_LEFT + (tileIndex % this.cols) * TILE_SIZE,
          TARGET_TOP + (tileIndex % this.rows) * TILE_SIZE,
          "" + colour,
        )
        .setOrigin(0, 0);
      this.allTiles.push(targetTile);

      // drop zone in build area for this tile
      const zone = this.add
        .zone(
          BUILD_AREA_LEFT + (tileIndex % this.cols) * TILE_SIZE + TILE_SIZE / 2,
          BUILD_AREA_TOP + (tileIndex % this.rows) * TILE_SIZE + TILE_SIZE / 2,
          TILE_SIZE,
          TILE_SIZE,
        )
        .setRectangleDropZone(TILE_SIZE, TILE_SIZE)
        // make sure the zones are always underneath the tiles, so tiles can be
        // picked up and dragged even after being dropped on a zone (don't let
        // the zone intercept the pointer interactions)
        .setToBack();
      this.allTiles.push(zone);

      //  Just a visual display of the drop zone, for debugging
      // const graphics = this.add.graphics();
      // graphics.lineStyle(2, 0x000000);
      // graphics.strokeRect(
      //   zone.x - zone.input?.hitArea.width / 2,
      //   zone.y - zone.input?.hitArea.height / 2,
      //   zone.input?.hitArea.width,
      //   zone.input?.hitArea.height,
      // );

      const buildTile = this.add
        .sprite(
          TARGET_LEFT + this.buildTileXOffsets[tileIndex - 1] + tileIndex * 10,
          TARGET_TOP +
            3 * TILE_SIZE +
            this.buildTileYOffsets[tileIndex - 1] +
            tileIndex * 3,
          "" + colour,
        )
        .setOrigin(0, 0)
        .setInteractive({ draggable: true })
        .on("dragstart", () => {
          // Make sure the current tile is always visually at the top
          buildTile.setToTop();
        })
        .on("drag", (_pointer: Pointer, dragX: number, dragY: number) => {
          buildTile.setPosition(dragX, dragY);
        })
        .on("drop", (_pointer: never, dropZone: Zone) => {
          // Snap the tile to the location created for it... doing silly math because of inconsistent origins
          buildTile.x = dropZone.x - dropZone.input?.hitArea.width / 2;
          buildTile.y = dropZone.y - dropZone.input?.hitArea.height / 2;
          // FIXME disable drop zones when there is a tile snapped to it, and enable them again if it leaves
        });
      this.allTiles.push(buildTile);
    }
  }

  private removeExistingTiles() {
    this.allTiles.forEach((item) => item.destroy());
  }
}
