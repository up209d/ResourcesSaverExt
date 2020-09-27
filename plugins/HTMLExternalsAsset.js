// From: https://github.com/stoically/parcel-plugin-html-parcelExternals
const minimatch = require('minimatch');
const HTMLAsset = require('parcel-bundler/src/assets/HTMLAsset');

class HTMLExternalsAsset extends HTMLAsset {
  async collectDependencies() {
    const pkg = await this.getPackage();
    if (pkg && pkg.parcelExternals) {
      this.ast = new Proxy(this.ast, {
        get(target, key) {
          if (key === 'walk') {
            return _walk.call(
              target,
              target[key],
              pkg.parcelExternals
            );
          }
          return target[key];
        },
      });
    }
    return HTMLAsset.prototype.collectDependencies.call(this);
  }
}

function _walk(walk, parcelExternals) {
  return htmlWalkFn =>
    walk.call(this, node => {
      const src =
        node.attrs &&
        ((node.tag === 'script' && node.attrs.src) ||
          (node.tag === 'link' &&
            node.attrs.rel === 'stylesheet' &&
            node.attrs.href));
      if (
        src &&
        parcelExternals.find(external => minimatch(src, external))
      ) {
        return node;
      }
      return htmlWalkFn(node);
    });
}

module.exports = HTMLExternalsAsset;
