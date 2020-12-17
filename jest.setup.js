// crypto to mimic browser environment
import { Crypto } from "@peculiar/webcrypto";
global.crypto = new Crypto();

// TextEncoder
import { TextEncoder } from 'util';
global.TextEncoder = TextEncoder;
