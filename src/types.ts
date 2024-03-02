export interface PinConfigRequest {
    pin: number
    direction: 'input' | 'output'
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
