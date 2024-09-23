import * as r from "restructure";
import StartOfFrameMarker from "./sof.js";
import DefineHuffmanTableMarker from "./dht.js";
import DACMarker from "./dac.js";
import StartOfImageMarker from "./soi.js";
import SOSMarker from "./sos.js";
import DQTMarker from "./dqt.js";
import DRIMarker from "./dri.js";
import EXIFMarker from "./exif.js";

const JFIFIdentifier = "JFIF ";
const JFXXIdentifier = "JFXX "

const JFIFData = new r.Struct({
  version: r.uint16be,
  units: r.uint8,
  xDensity: r.uint16be,
  yDensity: r.uint16be,
  thumbnailWidth: r.uint8,
  thumbnailHeight: r.uint8,
})

const JFIFMarkerForExtension = {
  name: () => "JFIF",
  length: r.uint16be,
  identifier: new r.String(5),
  data: JFIFData,
}

const EOIMarkerForExtension = {
  name: () => "EOI",
}

const JPEGExtensionData = new r.VersionedStruct(r.uint16be, {
  0xffc0: StartOfFrameMarker,
  0xffc1: StartOfFrameMarker,
  0xffc2: StartOfFrameMarker,
  0xffc3: StartOfFrameMarker,
  0xffc4: DefineHuffmanTableMarker,
  0xffc5: StartOfFrameMarker,
  0xffc6: StartOfFrameMarker,
  0xffc7: StartOfFrameMarker,
  0xffc9: StartOfFrameMarker,
  0xffca: StartOfFrameMarker,
  0xffcb: StartOfFrameMarker,
  0xffcc: DACMarker,
  0xffcd: StartOfFrameMarker,
  0xffce: StartOfFrameMarker,
  0xffcf: StartOfFrameMarker,
  0xffd8: StartOfImageMarker,
  0xffd9: EOIMarkerForExtension,
  0xffda: SOSMarker,
  0xffdb: DQTMarker,
  0xffdd: DRIMarker,
  0xffe0: JFIFMarkerForExtension,
  0xffe1: EXIFMarker,
});

class Extension {
  decode(stream, parent) {
    switch (parent.extensionCode) {
      case 0x16:
        return JPEGExtensionData.decode(stream, parent);
      case 0x11:
      case 0x13:
        return null;
    }
  }
}

const extension = new r.Struct({
  extensionCode: r.uint8,
  extensionData: new Extension(),
})

const JFIFMarker = {
  name: () => "JFIF",
  length: r.uint16be,
  identifier: new r.String(5),
  data: new r.Optional(JFIFData, function() {
    return this.identifier === JFIFIdentifier;
  }),
  extension: new r.Optional(extension, function() {
    return this.identifier === JFXXIdentifier;
  }),
};

export default JFIFMarker;
