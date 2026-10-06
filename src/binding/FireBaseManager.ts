import { firebaseConfig } from '../helper/configs'

// import firebase from 'firebase';

interface LogData {
  [key: string]: string | number
}

declare const firebase: any

export default class FireBaseManager {
  private static isAvailable(): boolean {
    return typeof firebase !== 'undefined' && !!firebase
  }

  public static firebaseInit() {
    if (!this.isAvailable()) {
      return
    }
    firebase.initializeApp(firebaseConfig)
    firebase.analytics()
  }

  public static firebaseLog(event: string, params?: LogData) {
    if (!this.isAvailable()) {
      return
    }
    firebase.analytics().logEvent(event, params)
  }

  public static setUserProperty(name: string, value: string): void {
    if (!this.isAvailable()) {
      return
    }
    firebase.analytics().setUserProperties({ [name]: value })
  }
}
