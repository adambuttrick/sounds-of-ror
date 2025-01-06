class InstrumentManager {
    constructor() {
        this.currentInstrument = null;
        this.loadedInstruments = {};
        this.isLoading = false;
        
        this.availableInstruments = {
            'piano': {
                baseUrl: './samples/piano/'
            },
            'guitar': {
                baseUrl: './samples/guitar/'
            },
            'violin': {
                baseUrl: './samples/violin/'
            },
            'xylophone': {
                baseUrl: './samples/xylophone/'
            }
        };
    }

    async loadInstrument(instrumentName) {
        if (!this.availableInstruments[instrumentName]) {
            throw new Error(`Instrument ${instrumentName} not found`);
        }

        if (this.loadedInstruments[instrumentName]) {
            this.currentInstrument = this.loadedInstruments[instrumentName];
            return this.currentInstrument;
        }

        this.isLoading = true;
        
        try {
            const instrumentConfig = this.availableInstruments[instrumentName];
            
            const checkSample = async (url) => {
                try {
                    const response = await fetch(url, { method: 'HEAD' });
                    return response.ok;
                } catch {
                    return false;
                }
            };

            const loadExistingSamples = async () => {
                const notes = ['C', 'G'];
                const octaves = ['1', '2', '3', '4', '5', '6', '7'];
                const sampleUrls = {};

                for (const note of notes) {
                    for (const octave of octaves) {
                        const filename = `${note}${octave}.mp3`;
                        const url = instrumentConfig.baseUrl + filename;
                        const exists = await checkSample(url);
                        if (exists) {
                            sampleUrls[`${note}${octave}`] = url;
                        }
                    }
                }
                
                return sampleUrls;
            };

            const samples = await loadExistingSamples();

            if (Object.keys(samples).length === 0) {
                throw new Error(`No samples available for ${instrumentName}`);
            }

            console.log(`Found ${Object.keys(samples).length} samples for ${instrumentName}`);
            
            const sampler = new Tone.Sampler({
                urls: samples,
                baseUrl: "",
                onload: () => {
                    this.isLoading = false;
                    console.log(`${instrumentName} loaded successfully with ${Object.keys(samples).length} samples`);
                },
                onerror: (error) => {
                    console.warn(`Some samples failed to load for ${instrumentName}:`, error);
                    this.isLoading = false;
                }
            }).toDestination();

            this.loadedInstruments[instrumentName] = sampler;
            this.currentInstrument = sampler;
            return sampler;

        } catch (error) {
            this.isLoading = false;
            console.error(`Error loading ${instrumentName}:`, error);
            throw error;
        }
    }

    triggerAttackRelease(note, duration, time, velocity) {
        if (!this.currentInstrument) {
            console.warn('No instrument loaded, loading default piano');
            this.loadInstrument('piano').then(synth => {
                synth.triggerAttackRelease(note, duration, time, velocity);
            });
            return;
        }
        
        if (!this.isLoading) {
            this.currentInstrument.triggerAttackRelease(note, duration, time, velocity);
        }
    }

    getCurrentInstrument() {
        return this.currentInstrument;
    }

    isInstrumentAvailable(instrumentName) {
        return instrumentName in this.availableInstruments;
    }

    getLoadedInstruments() {
        return Object.keys(this.loadedInstruments);
    }
}

export const instrumentManager = new InstrumentManager();