export interface PinConfigRequest {
    pin: number
    direction: 'input' | 'output' | 'pwm'
    pull?: 'off' | 'down' | 'up'
    initialValue?: boolean
}

export interface ConfigureRequest {
    pins: PinConfigRequest[]
}

export interface SetPinRequest {
    pin: number
    on: boolean
}

export interface SetPinPWMRequest {
    pin: number
    range: number
    data: number
}

export interface ReadPinRequest {
    pin: number
}

export interface ReadPinResponse {
    on: boolean
}

export interface SubscribePinRequest {
    pin: number
}

export interface SubscribedPinValue {
    pin: number
    on: boolean
}
