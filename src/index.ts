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

let port = process.env.PORT
if (!port) {
    port = "8080"
}

const io = new Server(parseInt(port), {
    cors: {
        origin: "https://esp-frontend.palk.dev",
        methods: ["GET", "POST"],
    },
})

io.on("configurePin", (_: Socket, data: ConfigureRequest) => {
    for (const pin of data.pins) {
        const direction = pin.direction === "input" ? rpio.INPUT : rpio.OUTPUT

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

        rpio.open(pin.pin, direction, option)
    }
})

io.on("setPin", (_: Socket, data: SetPinRequest) => {
    rpio.write(data.pin, data.on ? rpio.HIGH : rpio.LOW)
})

io.on(
    "readPin",
    (_: Socket, data: ReadPinRequest, cb: (d: ReadPinResponse) => void) => {
        const value = rpio.read(data.pin)
        cb({
            on: value === rpio.HIGH,
        })
    },
)

io.on("subscribePin", (s: Socket, data: SubscribePinRequest) => {
    rpio.poll(data.pin, () => {
        const value = rpio.read(data.pin)
        const resp: SubscribedPinValue = {
            pin: data.pin,
            on: value === rpio.HIGH,
        }
        s.emit("subscribedPinValue", resp)
    })
})

io.on("unsubscribePin", (_: Socket, data: SubscribePinRequest) => {
    rpio.poll(data.pin, null)
})
