import { ICoordinates } from '../models';
import { collision, platformCollision } from '../utils/collision';
import { CollisionBlock } from './CollisionBlock';
import { Sprite } from './Sprite';

const gravity = 0.1;

interface IAnimations {
    imageSrc: string;
    frameRate: number;
    image: HTMLImageElement;
    frameBuffer: number;
}

interface ICamera {
    position: ICoordinates;
}

interface ICameraBox {
    position: ICoordinates;
    width: number;
    height: number;
}
export interface IHitBox {
    position: ICoordinates;
    width: number;
    height: number;
}

interface IPlayerConstructor {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D | null;
    imgSrc: string;
    position: ICoordinates;
    velocity: ICoordinates;
    collisionBlocks: CollisionBlock[];
    platformCollisionBlocks: CollisionBlock[];
    animations: Record<string, IAnimations>;
    frameRate?: number;
    scale?: number;
}

export class Player extends Sprite {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D | null;
    position: ICoordinates;
    velocity: ICoordinates;
    collisionBlocks: CollisionBlock[];
    platformCollisionBlocks: CollisionBlock[];
    animations: Record<string, IAnimations>;
    hitbox: IHitBox;
    lastDirection: string;
    cameraBox: ICameraBox;

    constructor({
        canvas,
        position,
        collisionBlocks,
        platformCollisionBlocks,
        imgSrc,
        animations,
        frameRate,
        scale = 0.5,
    }: IPlayerConstructor) {
        super(canvas.getContext('2d') as CanvasRenderingContext2D, {
            position,
            imgSrc,
            frameRate,
            scale,
        });
        this.velocity = { x: 0, y: 1 };
        this.position = position;

        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.collisionBlocks = collisionBlocks;
        this.platformCollisionBlocks = platformCollisionBlocks;
        this.lastDirection = 'right';
        this.hitbox = {
            position: {
                x: this.position.x,
                y: this.position.y,
            },
            width: 10,
            height: 10,
        };

        this.animations = animations;
        for (const key in this.animations) {
            const image = new Image();
            image.src = this.animations[key].imageSrc;

            this.animations[key].image = image;
        }

        this.cameraBox = {
            position: {
                x: this.position.x,
                y: this.position.y,
            },
            width: 200,
            height: 80,
        };
    }

    switchSprite(key: string) {
        if (this.image === this.animations[key].image || !this.loaded) return;

        this.currentFrame = 0;
        this.image = this.animations[key].image;
        this.frameBuffer = this.animations[key].frameBuffer;
        this.frameRate = this.animations[key].frameBuffer;
    }

    updateCameraBox() {
        this.cameraBox = {
            position: {
                x: this.position.x,
                y: this.position.y,
            },
            width: 200,
            height: 80,
        };
    }

    checkForHorizontalCanvasCollision() {
        if (
            this.hitbox.position.x + this.hitbox.width + this.velocity.x >=
                576 ||
            this.hitbox.position.x + this.velocity.x <= 0
        ) {
            this.velocity.x = 0;
        }
    }

    shouldPanCameraToTheLeft(canvas: HTMLCanvasElement, camera: ICamera) {
        const cameraBoxRightSide =
            this.cameraBox.position.x + this.cameraBox.width;
        const scaledDownCanvasWIdth = canvas.width / 4;

        if (cameraBoxRightSide >= 576) {
            return;
        }
        if (
            cameraBoxRightSide >=
            scaledDownCanvasWIdth + Math.abs(camera.position.x)
        ) {
            camera.position.x -= this.velocity.x;
        }
    }
    shouldPanCameraToTheRight(canvas: HTMLCanvasElement, camera: ICamera) {
        if (this.cameraBox.position.x <= 0) return;

        if (this.cameraBox.position.x <= Math.abs(camera.position.x)) {
            camera.position.x -= this.velocity.x;
        }
    }

    update() {
        this.updateFrames();
        this.updateHitBox();

        // draws out the image
        if (this.context) {
            this.context.fillStyle = 'rgba(0, 0, 255, 0.2)';
            this.context.fillRect(
                this.cameraBox.position.x,
                this.cameraBox.position.y,
                this.cameraBox.width,
                this.cameraBox.height,
            );

            // this.context.fillStyle = 'rgba(0, 255, 0, 0.2)';
            // this.context.fillRect(
            //     this.position.x,
            //     this.position.y,
            //     this.width,
            //     this.height,
            // );
            // this.context.fillStyle = 'rgba(255, 0, 0, 0.2)';
            // this.context?.fillRect(
            //     this.hitbox.position.x,
            //     this.hitbox.position.y,
            //     this.hitbox.width,
            //     this.hitbox.height,
            // );
        }

        this.draw();

        this.position.x += this.velocity.x;
        this.updateHitBox();
        this.checkForHorizontalCollisions();
        this.applyGravity();
        this.updateHitBox();
        this.checkForVerticalCollisions();
    }

    updateHitBox() {
        this.hitbox = {
            position: {
                x: this.position.x + 35,
                y: this.position.y + 26,
            },
            width: 14,
            height: 27,
        };
    }

    checkForHorizontalCollisions() {
        for (let i = 0; i < this.collisionBlocks.length; i++) {
            const collisionBlock = this.collisionBlocks[i];

            if (collision(this.hitbox, collisionBlock)) {
                if (this.velocity.x > 0) {
                    this.velocity.x = 0;

                    const offset =
                        this.hitbox.position.x -
                        this.position.x +
                        this.hitbox.width;

                    this.position.x = collisionBlock.position.x - offset - 0.01;
                    break;
                }

                if (this.velocity.x < 0) {
                    this.velocity.x = 0;

                    const offset = this.hitbox.position.x - this.position.x;

                    this.position.x =
                        collisionBlock.position.x +
                        collisionBlock.width -
                        offset +
                        0.01;
                    break;
                }
            }
        }
    }

    applyGravity() {
        this.velocity.y += gravity;
        this.position.y += this.velocity.y;
    }

    checkForVerticalCollisions() {
        for (let i = 0; i < this.collisionBlocks.length; i++) {
            const collisionBlock = this.collisionBlocks[i];

            if (collision(this.hitbox, collisionBlock)) {
                if (this.velocity.y > 0) {
                    this.velocity.y = 0;

                    const offset =
                        this.hitbox.position.y -
                        this.position.y +
                        this.hitbox.height;

                    this.position.y = collisionBlock.position.y - offset - 0.01;
                    break;
                }

                if (this.velocity.y < 0) {
                    this.velocity.y = 0;
                    this.position.y =
                        collisionBlock.position.y +
                        collisionBlock.height +
                        0.01;
                    break;
                }
            }
        }

        // коллизии с платформами.
        for (let i = 0; i < this.platformCollisionBlocks.length; i++) {
            const platformCollisionBlock = this.platformCollisionBlocks[i];

            if (platformCollision(this.hitbox, platformCollisionBlock)) {
                if (this.velocity.y > 0) {
                    this.velocity.y = 0;

                    const offset =
                        this.hitbox.position.y -
                        this.position.y +
                        this.hitbox.height;

                    this.position.y =
                        platformCollisionBlock.position.y - offset - 0.01;
                    break;
                }

                // if (this.velocity.y < 0) {
                //     this.velocity.y = 0;
                //     this.position.y =
                //         platformCollisionBlock.position.y +
                //         platformCollisionBlock.height +
                //         0.01;
                //     break;
                // }
            }
        }
    }
}
