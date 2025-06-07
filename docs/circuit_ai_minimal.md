# Circuit AI Minimal Integration

This document explains how to replicate the workflow described in the IEEE article
*Circuit AI for Bill of Materials, Switching Loss Optimization, Capacitor RMS Estimation, and More*.
It focuses on a light‑weight implementation that works with this repository.

## 1. Parts proxy
Create a small Node.js service that hides the Mouser and DigiKey APIs behind a
single endpoint. A reference implementation is provided in `parts_proxy.js`.
Install the dependencies and run the server:

```bash
npm install express axios
MOUSER_API_KEY=<your_key> node parts_proxy.js
```

Requesting `/searchMouser?q=NE555` returns a JSON payload with price, stock and
datasheet URL for the best match.

## 2. GPT‑4o Function Calling
Define the following schema when creating your OpenAI Assistant so it can call
the parts proxy automatically:

```json
{
  "name": "searchMouser",
  "description": "Look up electronic parts",
  "parameters": {
    "type": "object",
    "properties": { "searchquery": { "type": "string" } },
    "required": ["searchquery"]
  }
}
```

## 3. Code Interpreter
Enable the Code Interpreter tool for your assistant. This allows it to run short
Python snippets to evaluate switching losses and capacitor ripple without hosting
your own Python runtime.

Example prompt:

```
For the C3M0065090J MOSFET at 400 V, 10 A, 100 kHz, calculate P_switch & P_cond
with tr = 25 ns, tf = 22 ns.
```

The assistant uses the equations from the paper to compute the results.

## 4. BOM workflow
Export a BOM from KiCad or Altium and upload it to the assistant. Ask it to flag
EOL parts and suggest in‑stock replacements under a desired price. The assistant
will call `searchMouser`, fetch data from the proxy and return a cleaned table.

## 5. Optional fine‑tuning
If you have measured waveforms, prepare a JSONL file with messages describing
`Vin`, `Iin` and `I_cap_rms`. Fine‑tune a GPT‑3.5 or GPT‑4o model with that data
for near real‑time predictions of capacitor RMS current.
