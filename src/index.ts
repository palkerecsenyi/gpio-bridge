import { Server, Socket } from "socket.io"
import type {
    ConfigureRequest,
    ReadPinRequest,
    ReadPinResponse,
    SetPinRequest,
    SubscribePinRequest,
    SubscribedPinValue,
} from "./types"
import rpio from "rpio"
import { createServer } from "node:http"

const server = createServer()
const io = new Server(server, {
    cors: {
        origin: "https://esp-frontend.palk.dev",
        methods: ["GET", "POST"],
    },
})

io.on("connection", (socket) => {
    socket.on("configurePin", (data: ConfigureRequest) => {
        console.log("configuring pin")
        for (const pin of data.pins) {
            const direction =
                pin.direction === "input" ? rpio.INPUT : rpio.OUTPUT

            const option =
                pin.pull === "off"
                    ? rpio.PULL_OFF
                    : pin.pull === "down"
                      ? rpio.PULL_DOWN
                      : pin.pull === "up"
                          ? rpio.PULL_UP
                          : pin.initialValue === true
                              ? rpio.HIGH
                              : pin.initialValue === false
                                  ? rpio.LOW
                                  : undefined

            console.log(
                `opening pin ${pin.pin} direction ${direction} option ${option}`,
            )
            rpio.open(pin.pin, direction, option)
        }
    })

    socket.on("setPin", (data: SetPinRequest) => {
        rpio.write(data.pin, data.on ? rpio.HIGH : rpio.LOW)
    })

    socket.on(
        "readPin",
        (data: ReadPinRequest, cb: (d: ReadPinResponse) => void) => {
            const value = rpio.read(data.pin)
            cb({
                on: value === rpio.HIGH,
            })
        },
    )

    socket.on("subscribePin", (data: SubscribePinRequest) => {
        console.log("NEW pin subscription: ", data)

        rpio.poll(data.pin, null)
        rpio.poll(data.pin, () => {
            const value = rpio.read(data.pin)
            const resp: SubscribedPinValue = {
                pin: data.pin,
                on: value === rpio.HIGH,
            }
            socket.emit("subscribedPinValue", resp)
        })
    })

    socket.on("unsubscribePin", (data: SubscribePinRequest) => {
        console.log("UNsubscribing pin: ", data)
        rpio.poll(data.pin, null)
    })
})

let port = process.env.PORT
if (!port) {
    port = "8080"
}

server.listen(port, () => {
    console.log("ready!")
})
