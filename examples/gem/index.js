(() => {
  // node_modules/orderedmap/index.es.js
  function OrderedMap(content2) {
    this.content = content2;
  }
  OrderedMap.prototype = {
    constructor: OrderedMap,
    find: function(key) {
      for (var i = 0; i < this.content.length; i += 2)
        if (this.content[i] === key)
          return i;
      return -1;
    },
    get: function(key) {
      var found2 = this.find(key);
      return found2 == -1 ? void 0 : this.content[found2 + 1];
    },
    update: function(key, value, newKey) {
      var self = newKey && newKey != key ? this.remove(newKey) : this;
      var found2 = self.find(key), content2 = self.content.slice();
      if (found2 == -1) {
        content2.push(newKey || key, value);
      } else {
        content2[found2 + 1] = value;
        if (newKey)
          content2[found2] = newKey;
      }
      return new OrderedMap(content2);
    },
    remove: function(key) {
      var found2 = this.find(key);
      if (found2 == -1)
        return this;
      var content2 = this.content.slice();
      content2.splice(found2, 2);
      return new OrderedMap(content2);
    },
    addToStart: function(key, value) {
      return new OrderedMap([key, value].concat(this.remove(key).content));
    },
    addToEnd: function(key, value) {
      var content2 = this.remove(key).content.slice();
      content2.push(key, value);
      return new OrderedMap(content2);
    },
    addBefore: function(place, key, value) {
      var without = this.remove(key), content2 = without.content.slice();
      var found2 = without.find(place);
      content2.splice(found2 == -1 ? content2.length : found2, 0, key, value);
      return new OrderedMap(content2);
    },
    forEach: function(f) {
      for (var i = 0; i < this.content.length; i += 2)
        f(this.content[i], this.content[i + 1]);
    },
    prepend: function(map14) {
      map14 = OrderedMap.from(map14);
      if (!map14.size)
        return this;
      return new OrderedMap(map14.content.concat(this.subtract(map14).content));
    },
    append: function(map14) {
      map14 = OrderedMap.from(map14);
      if (!map14.size)
        return this;
      return new OrderedMap(this.subtract(map14).content.concat(map14.content));
    },
    subtract: function(map14) {
      var result2 = this;
      map14 = OrderedMap.from(map14);
      for (var i = 0; i < map14.content.length; i += 2)
        result2 = result2.remove(map14.content[i]);
      return result2;
    },
    get size() {
      return this.content.length >> 1;
    }
  };
  OrderedMap.from = function(value) {
    if (value instanceof OrderedMap)
      return value;
    var content2 = [];
    if (value)
      for (var prop in value)
        content2.push(prop, value[prop]);
    return new OrderedMap(content2);
  };
  var orderedmap = OrderedMap;
  var index_es_default = orderedmap;

  // node_modules/prosemirror-model/dist/index.es.js
  function findDiffStart(a, b, pos) {
    for (var i = 0; ; i++) {
      if (i == a.childCount || i == b.childCount) {
        return a.childCount == b.childCount ? null : pos;
      }
      var childA = a.child(i), childB = b.child(i);
      if (childA == childB) {
        pos += childA.nodeSize;
        continue;
      }
      if (!childA.sameMarkup(childB)) {
        return pos;
      }
      if (childA.isText && childA.text != childB.text) {
        for (var j = 0; childA.text[j] == childB.text[j]; j++) {
          pos++;
        }
        return pos;
      }
      if (childA.content.size || childB.content.size) {
        var inner = findDiffStart(childA.content, childB.content, pos + 1);
        if (inner != null) {
          return inner;
        }
      }
      pos += childA.nodeSize;
    }
  }
  function findDiffEnd(a, b, posA, posB) {
    for (var iA = a.childCount, iB = b.childCount; ; ) {
      if (iA == 0 || iB == 0) {
        return iA == iB ? null : {a: posA, b: posB};
      }
      var childA = a.child(--iA), childB = b.child(--iB), size = childA.nodeSize;
      if (childA == childB) {
        posA -= size;
        posB -= size;
        continue;
      }
      if (!childA.sameMarkup(childB)) {
        return {a: posA, b: posB};
      }
      if (childA.isText && childA.text != childB.text) {
        var same = 0, minSize = Math.min(childA.text.length, childB.text.length);
        while (same < minSize && childA.text[childA.text.length - same - 1] == childB.text[childB.text.length - same - 1]) {
          same++;
          posA--;
          posB--;
        }
        return {a: posA, b: posB};
      }
      if (childA.content.size || childB.content.size) {
        var inner = findDiffEnd(childA.content, childB.content, posA - 1, posB - 1);
        if (inner) {
          return inner;
        }
      }
      posA -= size;
      posB -= size;
    }
  }
  var Fragment = function Fragment2(content2, size) {
    this.content = content2;
    this.size = size || 0;
    if (size == null) {
      for (var i = 0; i < content2.length; i++) {
        this.size += content2[i].nodeSize;
      }
    }
  };
  var prototypeAccessors = {firstChild: {configurable: true}, lastChild: {configurable: true}, childCount: {configurable: true}};
  Fragment.prototype.nodesBetween = function nodesBetween(from4, to, f, nodeStart, parent) {
    if (nodeStart === void 0)
      nodeStart = 0;
    for (var i = 0, pos = 0; pos < to; i++) {
      var child3 = this.content[i], end2 = pos + child3.nodeSize;
      if (end2 > from4 && f(child3, nodeStart + pos, parent, i) !== false && child3.content.size) {
        var start3 = pos + 1;
        child3.nodesBetween(Math.max(0, from4 - start3), Math.min(child3.content.size, to - start3), f, nodeStart + start3);
      }
      pos = end2;
    }
  };
  Fragment.prototype.descendants = function descendants(f) {
    this.nodesBetween(0, this.size, f);
  };
  Fragment.prototype.textBetween = function textBetween(from4, to, blockSeparator, leafText) {
    var text2 = "", separated = true;
    this.nodesBetween(from4, to, function(node4, pos) {
      if (node4.isText) {
        text2 += node4.text.slice(Math.max(from4, pos) - pos, to - pos);
        separated = !blockSeparator;
      } else if (node4.isLeaf && leafText) {
        text2 += typeof leafText === "function" ? leafText(node4) : leafText;
        separated = !blockSeparator;
      } else if (!separated && node4.isBlock) {
        text2 += blockSeparator;
        separated = true;
      }
    }, 0);
    return text2;
  };
  Fragment.prototype.append = function append(other) {
    if (!other.size) {
      return this;
    }
    if (!this.size) {
      return other;
    }
    var last = this.lastChild, first = other.firstChild, content2 = this.content.slice(), i = 0;
    if (last.isText && last.sameMarkup(first)) {
      content2[content2.length - 1] = last.withText(last.text + first.text);
      i = 1;
    }
    for (; i < other.content.length; i++) {
      content2.push(other.content[i]);
    }
    return new Fragment(content2, this.size + other.size);
  };
  Fragment.prototype.cut = function cut(from4, to) {
    if (to == null) {
      to = this.size;
    }
    if (from4 == 0 && to == this.size) {
      return this;
    }
    var result2 = [], size = 0;
    if (to > from4) {
      for (var i = 0, pos = 0; pos < to; i++) {
        var child3 = this.content[i], end2 = pos + child3.nodeSize;
        if (end2 > from4) {
          if (pos < from4 || end2 > to) {
            if (child3.isText) {
              child3 = child3.cut(Math.max(0, from4 - pos), Math.min(child3.text.length, to - pos));
            } else {
              child3 = child3.cut(Math.max(0, from4 - pos - 1), Math.min(child3.content.size, to - pos - 1));
            }
          }
          result2.push(child3);
          size += child3.nodeSize;
        }
        pos = end2;
      }
    }
    return new Fragment(result2, size);
  };
  Fragment.prototype.cutByIndex = function cutByIndex(from4, to) {
    if (from4 == to) {
      return Fragment.empty;
    }
    if (from4 == 0 && to == this.content.length) {
      return this;
    }
    return new Fragment(this.content.slice(from4, to));
  };
  Fragment.prototype.replaceChild = function replaceChild(index2, node4) {
    var current = this.content[index2];
    if (current == node4) {
      return this;
    }
    var copy5 = this.content.slice();
    var size = this.size + node4.nodeSize - current.nodeSize;
    copy5[index2] = node4;
    return new Fragment(copy5, size);
  };
  Fragment.prototype.addToStart = function addToStart(node4) {
    return new Fragment([node4].concat(this.content), this.size + node4.nodeSize);
  };
  Fragment.prototype.addToEnd = function addToEnd(node4) {
    return new Fragment(this.content.concat(node4), this.size + node4.nodeSize);
  };
  Fragment.prototype.eq = function eq(other) {
    if (this.content.length != other.content.length) {
      return false;
    }
    for (var i = 0; i < this.content.length; i++) {
      if (!this.content[i].eq(other.content[i])) {
        return false;
      }
    }
    return true;
  };
  prototypeAccessors.firstChild.get = function() {
    return this.content.length ? this.content[0] : null;
  };
  prototypeAccessors.lastChild.get = function() {
    return this.content.length ? this.content[this.content.length - 1] : null;
  };
  prototypeAccessors.childCount.get = function() {
    return this.content.length;
  };
  Fragment.prototype.child = function child(index2) {
    var found2 = this.content[index2];
    if (!found2) {
      throw new RangeError("Index " + index2 + " out of range for " + this);
    }
    return found2;
  };
  Fragment.prototype.maybeChild = function maybeChild(index2) {
    return this.content[index2];
  };
  Fragment.prototype.forEach = function forEach(f) {
    for (var i = 0, p = 0; i < this.content.length; i++) {
      var child3 = this.content[i];
      f(child3, p, i);
      p += child3.nodeSize;
    }
  };
  Fragment.prototype.findDiffStart = function findDiffStart$1(other, pos) {
    if (pos === void 0)
      pos = 0;
    return findDiffStart(this, other, pos);
  };
  Fragment.prototype.findDiffEnd = function findDiffEnd$1(other, pos, otherPos) {
    if (pos === void 0)
      pos = this.size;
    if (otherPos === void 0)
      otherPos = other.size;
    return findDiffEnd(this, other, pos, otherPos);
  };
  Fragment.prototype.findIndex = function findIndex(pos, round) {
    if (round === void 0)
      round = -1;
    if (pos == 0) {
      return retIndex(0, pos);
    }
    if (pos == this.size) {
      return retIndex(this.content.length, pos);
    }
    if (pos > this.size || pos < 0) {
      throw new RangeError("Position " + pos + " outside of fragment (" + this + ")");
    }
    for (var i = 0, curPos = 0; ; i++) {
      var cur = this.child(i), end2 = curPos + cur.nodeSize;
      if (end2 >= pos) {
        if (end2 == pos || round > 0) {
          return retIndex(i + 1, end2);
        }
        return retIndex(i, curPos);
      }
      curPos = end2;
    }
  };
  Fragment.prototype.toString = function toString() {
    return "<" + this.toStringInner() + ">";
  };
  Fragment.prototype.toStringInner = function toStringInner() {
    return this.content.join(", ");
  };
  Fragment.prototype.toJSON = function toJSON() {
    return this.content.length ? this.content.map(function(n) {
      return n.toJSON();
    }) : null;
  };
  Fragment.fromJSON = function fromJSON(schema2, value) {
    if (!value) {
      return Fragment.empty;
    }
    if (!Array.isArray(value)) {
      throw new RangeError("Invalid input for Fragment.fromJSON");
    }
    return new Fragment(value.map(schema2.nodeFromJSON));
  };
  Fragment.fromArray = function fromArray(array) {
    if (!array.length) {
      return Fragment.empty;
    }
    var joined, size = 0;
    for (var i = 0; i < array.length; i++) {
      var node4 = array[i];
      size += node4.nodeSize;
      if (i && node4.isText && array[i - 1].sameMarkup(node4)) {
        if (!joined) {
          joined = array.slice(0, i);
        }
        joined[joined.length - 1] = node4.withText(joined[joined.length - 1].text + node4.text);
      } else if (joined) {
        joined.push(node4);
      }
    }
    return new Fragment(joined || array, size);
  };
  Fragment.from = function from(nodes3) {
    if (!nodes3) {
      return Fragment.empty;
    }
    if (nodes3 instanceof Fragment) {
      return nodes3;
    }
    if (Array.isArray(nodes3)) {
      return this.fromArray(nodes3);
    }
    if (nodes3.attrs) {
      return new Fragment([nodes3], nodes3.nodeSize);
    }
    throw new RangeError("Can not convert " + nodes3 + " to a Fragment" + (nodes3.nodesBetween ? " (looks like multiple versions of prosemirror-model were loaded)" : ""));
  };
  Object.defineProperties(Fragment.prototype, prototypeAccessors);
  var found = {index: 0, offset: 0};
  function retIndex(index2, offset2) {
    found.index = index2;
    found.offset = offset2;
    return found;
  }
  Fragment.empty = new Fragment([], 0);
  function compareDeep(a, b) {
    if (a === b) {
      return true;
    }
    if (!(a && typeof a == "object") || !(b && typeof b == "object")) {
      return false;
    }
    var array = Array.isArray(a);
    if (Array.isArray(b) != array) {
      return false;
    }
    if (array) {
      if (a.length != b.length) {
        return false;
      }
      for (var i = 0; i < a.length; i++) {
        if (!compareDeep(a[i], b[i])) {
          return false;
        }
      }
    } else {
      for (var p in a) {
        if (!(p in b) || !compareDeep(a[p], b[p])) {
          return false;
        }
      }
      for (var p$1 in b) {
        if (!(p$1 in a)) {
          return false;
        }
      }
    }
    return true;
  }
  var Mark = function Mark2(type, attrs) {
    this.type = type;
    this.attrs = attrs;
  };
  Mark.prototype.addToSet = function addToSet(set2) {
    var copy5, placed = false;
    for (var i = 0; i < set2.length; i++) {
      var other = set2[i];
      if (this.eq(other)) {
        return set2;
      }
      if (this.type.excludes(other.type)) {
        if (!copy5) {
          copy5 = set2.slice(0, i);
        }
      } else if (other.type.excludes(this.type)) {
        return set2;
      } else {
        if (!placed && other.type.rank > this.type.rank) {
          if (!copy5) {
            copy5 = set2.slice(0, i);
          }
          copy5.push(this);
          placed = true;
        }
        if (copy5) {
          copy5.push(other);
        }
      }
    }
    if (!copy5) {
      copy5 = set2.slice();
    }
    if (!placed) {
      copy5.push(this);
    }
    return copy5;
  };
  Mark.prototype.removeFromSet = function removeFromSet(set2) {
    for (var i = 0; i < set2.length; i++) {
      if (this.eq(set2[i])) {
        return set2.slice(0, i).concat(set2.slice(i + 1));
      }
    }
    return set2;
  };
  Mark.prototype.isInSet = function isInSet(set2) {
    for (var i = 0; i < set2.length; i++) {
      if (this.eq(set2[i])) {
        return true;
      }
    }
    return false;
  };
  Mark.prototype.eq = function eq2(other) {
    return this == other || this.type == other.type && compareDeep(this.attrs, other.attrs);
  };
  Mark.prototype.toJSON = function toJSON2() {
    var obj = {type: this.type.name};
    for (var _ in this.attrs) {
      obj.attrs = this.attrs;
      break;
    }
    return obj;
  };
  Mark.fromJSON = function fromJSON2(schema2, json) {
    if (!json) {
      throw new RangeError("Invalid input for Mark.fromJSON");
    }
    var type = schema2.marks[json.type];
    if (!type) {
      throw new RangeError("There is no mark type " + json.type + " in this schema");
    }
    return type.create(json.attrs);
  };
  Mark.sameSet = function sameSet(a, b) {
    if (a == b) {
      return true;
    }
    if (a.length != b.length) {
      return false;
    }
    for (var i = 0; i < a.length; i++) {
      if (!a[i].eq(b[i])) {
        return false;
      }
    }
    return true;
  };
  Mark.setFrom = function setFrom(marks4) {
    if (!marks4 || marks4.length == 0) {
      return Mark.none;
    }
    if (marks4 instanceof Mark) {
      return [marks4];
    }
    var copy5 = marks4.slice();
    copy5.sort(function(a, b) {
      return a.type.rank - b.type.rank;
    });
    return copy5;
  };
  Mark.none = [];
  function ReplaceError(message) {
    var err2 = Error.call(this, message);
    err2.__proto__ = ReplaceError.prototype;
    return err2;
  }
  ReplaceError.prototype = Object.create(Error.prototype);
  ReplaceError.prototype.constructor = ReplaceError;
  ReplaceError.prototype.name = "ReplaceError";
  var Slice = function Slice2(content2, openStart, openEnd) {
    this.content = content2;
    this.openStart = openStart;
    this.openEnd = openEnd;
  };
  var prototypeAccessors$1 = {size: {configurable: true}};
  prototypeAccessors$1.size.get = function() {
    return this.content.size - this.openStart - this.openEnd;
  };
  Slice.prototype.insertAt = function insertAt(pos, fragment) {
    var content2 = insertInto(this.content, pos + this.openStart, fragment, null);
    return content2 && new Slice(content2, this.openStart, this.openEnd);
  };
  Slice.prototype.removeBetween = function removeBetween(from4, to) {
    return new Slice(removeRange(this.content, from4 + this.openStart, to + this.openStart), this.openStart, this.openEnd);
  };
  Slice.prototype.eq = function eq3(other) {
    return this.content.eq(other.content) && this.openStart == other.openStart && this.openEnd == other.openEnd;
  };
  Slice.prototype.toString = function toString2() {
    return this.content + "(" + this.openStart + "," + this.openEnd + ")";
  };
  Slice.prototype.toJSON = function toJSON3() {
    if (!this.content.size) {
      return null;
    }
    var json = {content: this.content.toJSON()};
    if (this.openStart > 0) {
      json.openStart = this.openStart;
    }
    if (this.openEnd > 0) {
      json.openEnd = this.openEnd;
    }
    return json;
  };
  Slice.fromJSON = function fromJSON3(schema2, json) {
    if (!json) {
      return Slice.empty;
    }
    var openStart = json.openStart || 0, openEnd = json.openEnd || 0;
    if (typeof openStart != "number" || typeof openEnd != "number") {
      throw new RangeError("Invalid input for Slice.fromJSON");
    }
    return new Slice(Fragment.fromJSON(schema2, json.content), openStart, openEnd);
  };
  Slice.maxOpen = function maxOpen(fragment, openIsolating) {
    if (openIsolating === void 0)
      openIsolating = true;
    var openStart = 0, openEnd = 0;
    for (var n = fragment.firstChild; n && !n.isLeaf && (openIsolating || !n.type.spec.isolating); n = n.firstChild) {
      openStart++;
    }
    for (var n$1 = fragment.lastChild; n$1 && !n$1.isLeaf && (openIsolating || !n$1.type.spec.isolating); n$1 = n$1.lastChild) {
      openEnd++;
    }
    return new Slice(fragment, openStart, openEnd);
  };
  Object.defineProperties(Slice.prototype, prototypeAccessors$1);
  function removeRange(content2, from4, to) {
    var ref = content2.findIndex(from4);
    var index2 = ref.index;
    var offset2 = ref.offset;
    var child3 = content2.maybeChild(index2);
    var ref$1 = content2.findIndex(to);
    var indexTo = ref$1.index;
    var offsetTo = ref$1.offset;
    if (offset2 == from4 || child3.isText) {
      if (offsetTo != to && !content2.child(indexTo).isText) {
        throw new RangeError("Removing non-flat range");
      }
      return content2.cut(0, from4).append(content2.cut(to));
    }
    if (index2 != indexTo) {
      throw new RangeError("Removing non-flat range");
    }
    return content2.replaceChild(index2, child3.copy(removeRange(child3.content, from4 - offset2 - 1, to - offset2 - 1)));
  }
  function insertInto(content2, dist, insert, parent) {
    var ref = content2.findIndex(dist);
    var index2 = ref.index;
    var offset2 = ref.offset;
    var child3 = content2.maybeChild(index2);
    if (offset2 == dist || child3.isText) {
      if (parent && !parent.canReplace(index2, index2, insert)) {
        return null;
      }
      return content2.cut(0, dist).append(insert).append(content2.cut(dist));
    }
    var inner = insertInto(child3.content, dist - offset2 - 1, insert);
    return inner && content2.replaceChild(index2, child3.copy(inner));
  }
  Slice.empty = new Slice(Fragment.empty, 0, 0);
  function replace($from, $to, slice4) {
    if (slice4.openStart > $from.depth) {
      throw new ReplaceError("Inserted content deeper than insertion position");
    }
    if ($from.depth - slice4.openStart != $to.depth - slice4.openEnd) {
      throw new ReplaceError("Inconsistent open depths");
    }
    return replaceOuter($from, $to, slice4, 0);
  }
  function replaceOuter($from, $to, slice4, depth) {
    var index2 = $from.index(depth), node4 = $from.node(depth);
    if (index2 == $to.index(depth) && depth < $from.depth - slice4.openStart) {
      var inner = replaceOuter($from, $to, slice4, depth + 1);
      return node4.copy(node4.content.replaceChild(index2, inner));
    } else if (!slice4.content.size) {
      return close(node4, replaceTwoWay($from, $to, depth));
    } else if (!slice4.openStart && !slice4.openEnd && $from.depth == depth && $to.depth == depth) {
      var parent = $from.parent, content2 = parent.content;
      return close(parent, content2.cut(0, $from.parentOffset).append(slice4.content).append(content2.cut($to.parentOffset)));
    } else {
      var ref = prepareSliceForReplace(slice4, $from);
      var start3 = ref.start;
      var end2 = ref.end;
      return close(node4, replaceThreeWay($from, start3, end2, $to, depth));
    }
  }
  function checkJoin(main2, sub) {
    if (!sub.type.compatibleContent(main2.type)) {
      throw new ReplaceError("Cannot join " + sub.type.name + " onto " + main2.type.name);
    }
  }
  function joinable($before, $after, depth) {
    var node4 = $before.node(depth);
    checkJoin(node4, $after.node(depth));
    return node4;
  }
  function addNode(child3, target) {
    var last = target.length - 1;
    if (last >= 0 && child3.isText && child3.sameMarkup(target[last])) {
      target[last] = child3.withText(target[last].text + child3.text);
    } else {
      target.push(child3);
    }
  }
  function addRange($start, $end, depth, target) {
    var node4 = ($end || $start).node(depth);
    var startIndex = 0, endIndex = $end ? $end.index(depth) : node4.childCount;
    if ($start) {
      startIndex = $start.index(depth);
      if ($start.depth > depth) {
        startIndex++;
      } else if ($start.textOffset) {
        addNode($start.nodeAfter, target);
        startIndex++;
      }
    }
    for (var i = startIndex; i < endIndex; i++) {
      addNode(node4.child(i), target);
    }
    if ($end && $end.depth == depth && $end.textOffset) {
      addNode($end.nodeBefore, target);
    }
  }
  function close(node4, content2) {
    if (!node4.type.validContent(content2)) {
      throw new ReplaceError("Invalid content for node " + node4.type.name);
    }
    return node4.copy(content2);
  }
  function replaceThreeWay($from, $start, $end, $to, depth) {
    var openStart = $from.depth > depth && joinable($from, $start, depth + 1);
    var openEnd = $to.depth > depth && joinable($end, $to, depth + 1);
    var content2 = [];
    addRange(null, $from, depth, content2);
    if (openStart && openEnd && $start.index(depth) == $end.index(depth)) {
      checkJoin(openStart, openEnd);
      addNode(close(openStart, replaceThreeWay($from, $start, $end, $to, depth + 1)), content2);
    } else {
      if (openStart) {
        addNode(close(openStart, replaceTwoWay($from, $start, depth + 1)), content2);
      }
      addRange($start, $end, depth, content2);
      if (openEnd) {
        addNode(close(openEnd, replaceTwoWay($end, $to, depth + 1)), content2);
      }
    }
    addRange($to, null, depth, content2);
    return new Fragment(content2);
  }
  function replaceTwoWay($from, $to, depth) {
    var content2 = [];
    addRange(null, $from, depth, content2);
    if ($from.depth > depth) {
      var type = joinable($from, $to, depth + 1);
      addNode(close(type, replaceTwoWay($from, $to, depth + 1)), content2);
    }
    addRange($to, null, depth, content2);
    return new Fragment(content2);
  }
  function prepareSliceForReplace(slice4, $along) {
    var extra = $along.depth - slice4.openStart, parent = $along.node(extra);
    var node4 = parent.copy(slice4.content);
    for (var i = extra - 1; i >= 0; i--) {
      node4 = $along.node(i).copy(Fragment.from(node4));
    }
    return {
      start: node4.resolveNoCache(slice4.openStart + extra),
      end: node4.resolveNoCache(node4.content.size - slice4.openEnd - extra)
    };
  }
  var ResolvedPos = function ResolvedPos2(pos, path, parentOffset) {
    this.pos = pos;
    this.path = path;
    this.depth = path.length / 3 - 1;
    this.parentOffset = parentOffset;
  };
  var prototypeAccessors$2 = {parent: {configurable: true}, doc: {configurable: true}, textOffset: {configurable: true}, nodeAfter: {configurable: true}, nodeBefore: {configurable: true}};
  ResolvedPos.prototype.resolveDepth = function resolveDepth(val) {
    if (val == null) {
      return this.depth;
    }
    if (val < 0) {
      return this.depth + val;
    }
    return val;
  };
  prototypeAccessors$2.parent.get = function() {
    return this.node(this.depth);
  };
  prototypeAccessors$2.doc.get = function() {
    return this.node(0);
  };
  ResolvedPos.prototype.node = function node(depth) {
    return this.path[this.resolveDepth(depth) * 3];
  };
  ResolvedPos.prototype.index = function index(depth) {
    return this.path[this.resolveDepth(depth) * 3 + 1];
  };
  ResolvedPos.prototype.indexAfter = function indexAfter(depth) {
    depth = this.resolveDepth(depth);
    return this.index(depth) + (depth == this.depth && !this.textOffset ? 0 : 1);
  };
  ResolvedPos.prototype.start = function start(depth) {
    depth = this.resolveDepth(depth);
    return depth == 0 ? 0 : this.path[depth * 3 - 1] + 1;
  };
  ResolvedPos.prototype.end = function end(depth) {
    depth = this.resolveDepth(depth);
    return this.start(depth) + this.node(depth).content.size;
  };
  ResolvedPos.prototype.before = function before(depth) {
    depth = this.resolveDepth(depth);
    if (!depth) {
      throw new RangeError("There is no position before the top-level node");
    }
    return depth == this.depth + 1 ? this.pos : this.path[depth * 3 - 1];
  };
  ResolvedPos.prototype.after = function after(depth) {
    depth = this.resolveDepth(depth);
    if (!depth) {
      throw new RangeError("There is no position after the top-level node");
    }
    return depth == this.depth + 1 ? this.pos : this.path[depth * 3 - 1] + this.path[depth * 3].nodeSize;
  };
  prototypeAccessors$2.textOffset.get = function() {
    return this.pos - this.path[this.path.length - 1];
  };
  prototypeAccessors$2.nodeAfter.get = function() {
    var parent = this.parent, index2 = this.index(this.depth);
    if (index2 == parent.childCount) {
      return null;
    }
    var dOff = this.pos - this.path[this.path.length - 1], child3 = parent.child(index2);
    return dOff ? parent.child(index2).cut(dOff) : child3;
  };
  prototypeAccessors$2.nodeBefore.get = function() {
    var index2 = this.index(this.depth);
    var dOff = this.pos - this.path[this.path.length - 1];
    if (dOff) {
      return this.parent.child(index2).cut(0, dOff);
    }
    return index2 == 0 ? null : this.parent.child(index2 - 1);
  };
  ResolvedPos.prototype.posAtIndex = function posAtIndex(index2, depth) {
    depth = this.resolveDepth(depth);
    var node4 = this.path[depth * 3], pos = depth == 0 ? 0 : this.path[depth * 3 - 1] + 1;
    for (var i = 0; i < index2; i++) {
      pos += node4.child(i).nodeSize;
    }
    return pos;
  };
  ResolvedPos.prototype.marks = function marks() {
    var parent = this.parent, index2 = this.index();
    if (parent.content.size == 0) {
      return Mark.none;
    }
    if (this.textOffset) {
      return parent.child(index2).marks;
    }
    var main2 = parent.maybeChild(index2 - 1), other = parent.maybeChild(index2);
    if (!main2) {
      var tmp = main2;
      main2 = other;
      other = tmp;
    }
    var marks4 = main2.marks;
    for (var i = 0; i < marks4.length; i++) {
      if (marks4[i].type.spec.inclusive === false && (!other || !marks4[i].isInSet(other.marks))) {
        marks4 = marks4[i--].removeFromSet(marks4);
      }
    }
    return marks4;
  };
  ResolvedPos.prototype.marksAcross = function marksAcross($end) {
    var after2 = this.parent.maybeChild(this.index());
    if (!after2 || !after2.isInline) {
      return null;
    }
    var marks4 = after2.marks, next = $end.parent.maybeChild($end.index());
    for (var i = 0; i < marks4.length; i++) {
      if (marks4[i].type.spec.inclusive === false && (!next || !marks4[i].isInSet(next.marks))) {
        marks4 = marks4[i--].removeFromSet(marks4);
      }
    }
    return marks4;
  };
  ResolvedPos.prototype.sharedDepth = function sharedDepth(pos) {
    for (var depth = this.depth; depth > 0; depth--) {
      if (this.start(depth) <= pos && this.end(depth) >= pos) {
        return depth;
      }
    }
    return 0;
  };
  ResolvedPos.prototype.blockRange = function blockRange(other, pred) {
    if (other === void 0)
      other = this;
    if (other.pos < this.pos) {
      return other.blockRange(this);
    }
    for (var d = this.depth - (this.parent.inlineContent || this.pos == other.pos ? 1 : 0); d >= 0; d--) {
      if (other.pos <= this.end(d) && (!pred || pred(this.node(d)))) {
        return new NodeRange(this, other, d);
      }
    }
  };
  ResolvedPos.prototype.sameParent = function sameParent(other) {
    return this.pos - this.parentOffset == other.pos - other.parentOffset;
  };
  ResolvedPos.prototype.max = function max(other) {
    return other.pos > this.pos ? other : this;
  };
  ResolvedPos.prototype.min = function min(other) {
    return other.pos < this.pos ? other : this;
  };
  ResolvedPos.prototype.toString = function toString3() {
    var str = "";
    for (var i = 1; i <= this.depth; i++) {
      str += (str ? "/" : "") + this.node(i).type.name + "_" + this.index(i - 1);
    }
    return str + ":" + this.parentOffset;
  };
  ResolvedPos.resolve = function resolve(doc2, pos) {
    if (!(pos >= 0 && pos <= doc2.content.size)) {
      throw new RangeError("Position " + pos + " out of range");
    }
    var path = [];
    var start3 = 0, parentOffset = pos;
    for (var node4 = doc2; ; ) {
      var ref = node4.content.findIndex(parentOffset);
      var index2 = ref.index;
      var offset2 = ref.offset;
      var rem = parentOffset - offset2;
      path.push(node4, index2, start3 + offset2);
      if (!rem) {
        break;
      }
      node4 = node4.child(index2);
      if (node4.isText) {
        break;
      }
      parentOffset = rem - 1;
      start3 += offset2 + 1;
    }
    return new ResolvedPos(pos, path, parentOffset);
  };
  ResolvedPos.resolveCached = function resolveCached(doc2, pos) {
    for (var i = 0; i < resolveCache.length; i++) {
      var cached = resolveCache[i];
      if (cached.pos == pos && cached.doc == doc2) {
        return cached;
      }
    }
    var result2 = resolveCache[resolveCachePos] = ResolvedPos.resolve(doc2, pos);
    resolveCachePos = (resolveCachePos + 1) % resolveCacheSize;
    return result2;
  };
  Object.defineProperties(ResolvedPos.prototype, prototypeAccessors$2);
  var resolveCache = [];
  var resolveCachePos = 0;
  var resolveCacheSize = 12;
  var NodeRange = function NodeRange2($from, $to, depth) {
    this.$from = $from;
    this.$to = $to;
    this.depth = depth;
  };
  var prototypeAccessors$1$1 = {start: {configurable: true}, end: {configurable: true}, parent: {configurable: true}, startIndex: {configurable: true}, endIndex: {configurable: true}};
  prototypeAccessors$1$1.start.get = function() {
    return this.$from.before(this.depth + 1);
  };
  prototypeAccessors$1$1.end.get = function() {
    return this.$to.after(this.depth + 1);
  };
  prototypeAccessors$1$1.parent.get = function() {
    return this.$from.node(this.depth);
  };
  prototypeAccessors$1$1.startIndex.get = function() {
    return this.$from.index(this.depth);
  };
  prototypeAccessors$1$1.endIndex.get = function() {
    return this.$to.indexAfter(this.depth);
  };
  Object.defineProperties(NodeRange.prototype, prototypeAccessors$1$1);
  var emptyAttrs = Object.create(null);
  var Node = function Node2(type, attrs, content2, marks4) {
    this.type = type;
    this.attrs = attrs;
    this.content = content2 || Fragment.empty;
    this.marks = marks4 || Mark.none;
  };
  var prototypeAccessors$3 = {nodeSize: {configurable: true}, childCount: {configurable: true}, textContent: {configurable: true}, firstChild: {configurable: true}, lastChild: {configurable: true}, isBlock: {configurable: true}, isTextblock: {configurable: true}, inlineContent: {configurable: true}, isInline: {configurable: true}, isText: {configurable: true}, isLeaf: {configurable: true}, isAtom: {configurable: true}};
  prototypeAccessors$3.nodeSize.get = function() {
    return this.isLeaf ? 1 : 2 + this.content.size;
  };
  prototypeAccessors$3.childCount.get = function() {
    return this.content.childCount;
  };
  Node.prototype.child = function child2(index2) {
    return this.content.child(index2);
  };
  Node.prototype.maybeChild = function maybeChild2(index2) {
    return this.content.maybeChild(index2);
  };
  Node.prototype.forEach = function forEach2(f) {
    this.content.forEach(f);
  };
  Node.prototype.nodesBetween = function nodesBetween2(from4, to, f, startPos) {
    if (startPos === void 0)
      startPos = 0;
    this.content.nodesBetween(from4, to, f, startPos, this);
  };
  Node.prototype.descendants = function descendants2(f) {
    this.nodesBetween(0, this.content.size, f);
  };
  prototypeAccessors$3.textContent.get = function() {
    return this.textBetween(0, this.content.size, "");
  };
  Node.prototype.textBetween = function textBetween2(from4, to, blockSeparator, leafText) {
    return this.content.textBetween(from4, to, blockSeparator, leafText);
  };
  prototypeAccessors$3.firstChild.get = function() {
    return this.content.firstChild;
  };
  prototypeAccessors$3.lastChild.get = function() {
    return this.content.lastChild;
  };
  Node.prototype.eq = function eq4(other) {
    return this == other || this.sameMarkup(other) && this.content.eq(other.content);
  };
  Node.prototype.sameMarkup = function sameMarkup(other) {
    return this.hasMarkup(other.type, other.attrs, other.marks);
  };
  Node.prototype.hasMarkup = function hasMarkup(type, attrs, marks4) {
    return this.type == type && compareDeep(this.attrs, attrs || type.defaultAttrs || emptyAttrs) && Mark.sameSet(this.marks, marks4 || Mark.none);
  };
  Node.prototype.copy = function copy(content2) {
    if (content2 === void 0)
      content2 = null;
    if (content2 == this.content) {
      return this;
    }
    return new this.constructor(this.type, this.attrs, content2, this.marks);
  };
  Node.prototype.mark = function mark(marks4) {
    return marks4 == this.marks ? this : new this.constructor(this.type, this.attrs, this.content, marks4);
  };
  Node.prototype.cut = function cut2(from4, to) {
    if (from4 == 0 && to == this.content.size) {
      return this;
    }
    return this.copy(this.content.cut(from4, to));
  };
  Node.prototype.slice = function slice(from4, to, includeParents) {
    if (to === void 0)
      to = this.content.size;
    if (includeParents === void 0)
      includeParents = false;
    if (from4 == to) {
      return Slice.empty;
    }
    var $from = this.resolve(from4), $to = this.resolve(to);
    var depth = includeParents ? 0 : $from.sharedDepth(to);
    var start3 = $from.start(depth), node4 = $from.node(depth);
    var content2 = node4.content.cut($from.pos - start3, $to.pos - start3);
    return new Slice(content2, $from.depth - depth, $to.depth - depth);
  };
  Node.prototype.replace = function replace$1(from4, to, slice4) {
    return replace(this.resolve(from4), this.resolve(to), slice4);
  };
  Node.prototype.nodeAt = function nodeAt(pos) {
    for (var node4 = this; ; ) {
      var ref = node4.content.findIndex(pos);
      var index2 = ref.index;
      var offset2 = ref.offset;
      node4 = node4.maybeChild(index2);
      if (!node4) {
        return null;
      }
      if (offset2 == pos || node4.isText) {
        return node4;
      }
      pos -= offset2 + 1;
    }
  };
  Node.prototype.childAfter = function childAfter(pos) {
    var ref = this.content.findIndex(pos);
    var index2 = ref.index;
    var offset2 = ref.offset;
    return {node: this.content.maybeChild(index2), index: index2, offset: offset2};
  };
  Node.prototype.childBefore = function childBefore(pos) {
    if (pos == 0) {
      return {node: null, index: 0, offset: 0};
    }
    var ref = this.content.findIndex(pos);
    var index2 = ref.index;
    var offset2 = ref.offset;
    if (offset2 < pos) {
      return {node: this.content.child(index2), index: index2, offset: offset2};
    }
    var node4 = this.content.child(index2 - 1);
    return {node: node4, index: index2 - 1, offset: offset2 - node4.nodeSize};
  };
  Node.prototype.resolve = function resolve2(pos) {
    return ResolvedPos.resolveCached(this, pos);
  };
  Node.prototype.resolveNoCache = function resolveNoCache(pos) {
    return ResolvedPos.resolve(this, pos);
  };
  Node.prototype.rangeHasMark = function rangeHasMark(from4, to, type) {
    var found2 = false;
    if (to > from4) {
      this.nodesBetween(from4, to, function(node4) {
        if (type.isInSet(node4.marks)) {
          found2 = true;
        }
        return !found2;
      });
    }
    return found2;
  };
  prototypeAccessors$3.isBlock.get = function() {
    return this.type.isBlock;
  };
  prototypeAccessors$3.isTextblock.get = function() {
    return this.type.isTextblock;
  };
  prototypeAccessors$3.inlineContent.get = function() {
    return this.type.inlineContent;
  };
  prototypeAccessors$3.isInline.get = function() {
    return this.type.isInline;
  };
  prototypeAccessors$3.isText.get = function() {
    return this.type.isText;
  };
  prototypeAccessors$3.isLeaf.get = function() {
    return this.type.isLeaf;
  };
  prototypeAccessors$3.isAtom.get = function() {
    return this.type.isAtom;
  };
  Node.prototype.toString = function toString4() {
    if (this.type.spec.toDebugString) {
      return this.type.spec.toDebugString(this);
    }
    var name = this.type.name;
    if (this.content.size) {
      name += "(" + this.content.toStringInner() + ")";
    }
    return wrapMarks(this.marks, name);
  };
  Node.prototype.contentMatchAt = function contentMatchAt(index2) {
    var match = this.type.contentMatch.matchFragment(this.content, 0, index2);
    if (!match) {
      throw new Error("Called contentMatchAt on a node with invalid content");
    }
    return match;
  };
  Node.prototype.canReplace = function canReplace(from4, to, replacement, start3, end2) {
    if (replacement === void 0)
      replacement = Fragment.empty;
    if (start3 === void 0)
      start3 = 0;
    if (end2 === void 0)
      end2 = replacement.childCount;
    var one = this.contentMatchAt(from4).matchFragment(replacement, start3, end2);
    var two = one && one.matchFragment(this.content, to);
    if (!two || !two.validEnd) {
      return false;
    }
    for (var i = start3; i < end2; i++) {
      if (!this.type.allowsMarks(replacement.child(i).marks)) {
        return false;
      }
    }
    return true;
  };
  Node.prototype.canReplaceWith = function canReplaceWith(from4, to, type, marks4) {
    if (marks4 && !this.type.allowsMarks(marks4)) {
      return false;
    }
    var start3 = this.contentMatchAt(from4).matchType(type);
    var end2 = start3 && start3.matchFragment(this.content, to);
    return end2 ? end2.validEnd : false;
  };
  Node.prototype.canAppend = function canAppend(other) {
    if (other.content.size) {
      return this.canReplace(this.childCount, this.childCount, other.content);
    } else {
      return this.type.compatibleContent(other.type);
    }
  };
  Node.prototype.check = function check() {
    if (!this.type.validContent(this.content)) {
      throw new RangeError("Invalid content for node " + this.type.name + ": " + this.content.toString().slice(0, 50));
    }
    var copy5 = Mark.none;
    for (var i = 0; i < this.marks.length; i++) {
      copy5 = this.marks[i].addToSet(copy5);
    }
    if (!Mark.sameSet(copy5, this.marks)) {
      throw new RangeError("Invalid collection of marks for node " + this.type.name + ": " + this.marks.map(function(m) {
        return m.type.name;
      }));
    }
    this.content.forEach(function(node4) {
      return node4.check();
    });
  };
  Node.prototype.toJSON = function toJSON4() {
    var obj = {type: this.type.name};
    for (var _ in this.attrs) {
      obj.attrs = this.attrs;
      break;
    }
    if (this.content.size) {
      obj.content = this.content.toJSON();
    }
    if (this.marks.length) {
      obj.marks = this.marks.map(function(n) {
        return n.toJSON();
      });
    }
    return obj;
  };
  Node.fromJSON = function fromJSON4(schema2, json) {
    if (!json) {
      throw new RangeError("Invalid input for Node.fromJSON");
    }
    var marks4 = null;
    if (json.marks) {
      if (!Array.isArray(json.marks)) {
        throw new RangeError("Invalid mark data for Node.fromJSON");
      }
      marks4 = json.marks.map(schema2.markFromJSON);
    }
    if (json.type == "text") {
      if (typeof json.text != "string") {
        throw new RangeError("Invalid text node in JSON");
      }
      return schema2.text(json.text, marks4);
    }
    var content2 = Fragment.fromJSON(schema2, json.content);
    return schema2.nodeType(json.type).create(json.attrs, content2, marks4);
  };
  Object.defineProperties(Node.prototype, prototypeAccessors$3);
  var TextNode = /* @__PURE__ */ function(Node3) {
    function TextNode2(type, attrs, content2, marks4) {
      Node3.call(this, type, attrs, null, marks4);
      if (!content2) {
        throw new RangeError("Empty text nodes are not allowed");
      }
      this.text = content2;
    }
    if (Node3)
      TextNode2.__proto__ = Node3;
    TextNode2.prototype = Object.create(Node3 && Node3.prototype);
    TextNode2.prototype.constructor = TextNode2;
    var prototypeAccessors$15 = {textContent: {configurable: true}, nodeSize: {configurable: true}};
    TextNode2.prototype.toString = function toString7() {
      if (this.type.spec.toDebugString) {
        return this.type.spec.toDebugString(this);
      }
      return wrapMarks(this.marks, JSON.stringify(this.text));
    };
    prototypeAccessors$15.textContent.get = function() {
      return this.text;
    };
    TextNode2.prototype.textBetween = function textBetween3(from4, to) {
      return this.text.slice(from4, to);
    };
    prototypeAccessors$15.nodeSize.get = function() {
      return this.text.length;
    };
    TextNode2.prototype.mark = function mark3(marks4) {
      return marks4 == this.marks ? this : new TextNode2(this.type, this.attrs, this.text, marks4);
    };
    TextNode2.prototype.withText = function withText(text2) {
      if (text2 == this.text) {
        return this;
      }
      return new TextNode2(this.type, this.attrs, text2, this.marks);
    };
    TextNode2.prototype.cut = function cut3(from4, to) {
      if (from4 === void 0)
        from4 = 0;
      if (to === void 0)
        to = this.text.length;
      if (from4 == 0 && to == this.text.length) {
        return this;
      }
      return this.withText(this.text.slice(from4, to));
    };
    TextNode2.prototype.eq = function eq12(other) {
      return this.sameMarkup(other) && this.text == other.text;
    };
    TextNode2.prototype.toJSON = function toJSON7() {
      var base2 = Node3.prototype.toJSON.call(this);
      base2.text = this.text;
      return base2;
    };
    Object.defineProperties(TextNode2.prototype, prototypeAccessors$15);
    return TextNode2;
  }(Node);
  function wrapMarks(marks4, str) {
    for (var i = marks4.length - 1; i >= 0; i--) {
      str = marks4[i].type.name + "(" + str + ")";
    }
    return str;
  }
  var ContentMatch = function ContentMatch2(validEnd) {
    this.validEnd = validEnd;
    this.next = [];
    this.wrapCache = [];
  };
  var prototypeAccessors$4 = {inlineContent: {configurable: true}, defaultType: {configurable: true}, edgeCount: {configurable: true}};
  ContentMatch.parse = function parse(string, nodeTypes) {
    var stream = new TokenStream(string, nodeTypes);
    if (stream.next == null) {
      return ContentMatch.empty;
    }
    var expr = parseExpr(stream);
    if (stream.next) {
      stream.err("Unexpected trailing text");
    }
    var match = dfa(nfa(expr));
    checkForDeadEnds(match, stream);
    return match;
  };
  ContentMatch.prototype.matchType = function matchType(type) {
    for (var i = 0; i < this.next.length; i += 2) {
      if (this.next[i] == type) {
        return this.next[i + 1];
      }
    }
    return null;
  };
  ContentMatch.prototype.matchFragment = function matchFragment(frag, start3, end2) {
    if (start3 === void 0)
      start3 = 0;
    if (end2 === void 0)
      end2 = frag.childCount;
    var cur = this;
    for (var i = start3; cur && i < end2; i++) {
      cur = cur.matchType(frag.child(i).type);
    }
    return cur;
  };
  prototypeAccessors$4.inlineContent.get = function() {
    var first = this.next[0];
    return first ? first.isInline : false;
  };
  prototypeAccessors$4.defaultType.get = function() {
    for (var i = 0; i < this.next.length; i += 2) {
      var type = this.next[i];
      if (!(type.isText || type.hasRequiredAttrs())) {
        return type;
      }
    }
  };
  ContentMatch.prototype.compatible = function compatible(other) {
    for (var i = 0; i < this.next.length; i += 2) {
      for (var j = 0; j < other.next.length; j += 2) {
        if (this.next[i] == other.next[j]) {
          return true;
        }
      }
    }
    return false;
  };
  ContentMatch.prototype.fillBefore = function fillBefore(after2, toEnd, startIndex) {
    if (toEnd === void 0)
      toEnd = false;
    if (startIndex === void 0)
      startIndex = 0;
    var seen = [this];
    function search(match, types) {
      var finished = match.matchFragment(after2, startIndex);
      if (finished && (!toEnd || finished.validEnd)) {
        return Fragment.from(types.map(function(tp) {
          return tp.createAndFill();
        }));
      }
      for (var i = 0; i < match.next.length; i += 2) {
        var type = match.next[i], next = match.next[i + 1];
        if (!(type.isText || type.hasRequiredAttrs()) && seen.indexOf(next) == -1) {
          seen.push(next);
          var found2 = search(next, types.concat(type));
          if (found2) {
            return found2;
          }
        }
      }
    }
    return search(this, []);
  };
  ContentMatch.prototype.findWrapping = function findWrapping(target) {
    for (var i = 0; i < this.wrapCache.length; i += 2) {
      if (this.wrapCache[i] == target) {
        return this.wrapCache[i + 1];
      }
    }
    var computed = this.computeWrapping(target);
    this.wrapCache.push(target, computed);
    return computed;
  };
  ContentMatch.prototype.computeWrapping = function computeWrapping(target) {
    var seen = Object.create(null), active = [{match: this, type: null, via: null}];
    while (active.length) {
      var current = active.shift(), match = current.match;
      if (match.matchType(target)) {
        var result2 = [];
        for (var obj = current; obj.type; obj = obj.via) {
          result2.push(obj.type);
        }
        return result2.reverse();
      }
      for (var i = 0; i < match.next.length; i += 2) {
        var type = match.next[i];
        if (!type.isLeaf && !type.hasRequiredAttrs() && !(type.name in seen) && (!current.type || match.next[i + 1].validEnd)) {
          active.push({match: type.contentMatch, type, via: current});
          seen[type.name] = true;
        }
      }
    }
  };
  prototypeAccessors$4.edgeCount.get = function() {
    return this.next.length >> 1;
  };
  ContentMatch.prototype.edge = function edge(n) {
    var i = n << 1;
    if (i >= this.next.length) {
      throw new RangeError("There's no " + n + "th edge in this content match");
    }
    return {type: this.next[i], next: this.next[i + 1]};
  };
  ContentMatch.prototype.toString = function toString5() {
    var seen = [];
    function scan(m) {
      seen.push(m);
      for (var i = 1; i < m.next.length; i += 2) {
        if (seen.indexOf(m.next[i]) == -1) {
          scan(m.next[i]);
        }
      }
    }
    scan(this);
    return seen.map(function(m, i) {
      var out = i + (m.validEnd ? "*" : " ") + " ";
      for (var i$1 = 0; i$1 < m.next.length; i$1 += 2) {
        out += (i$1 ? ", " : "") + m.next[i$1].name + "->" + seen.indexOf(m.next[i$1 + 1]);
      }
      return out;
    }).join("\n");
  };
  Object.defineProperties(ContentMatch.prototype, prototypeAccessors$4);
  ContentMatch.empty = new ContentMatch(true);
  var TokenStream = function TokenStream2(string, nodeTypes) {
    this.string = string;
    this.nodeTypes = nodeTypes;
    this.inline = null;
    this.pos = 0;
    this.tokens = string.split(/\s*(?=\b|\W|$)/);
    if (this.tokens[this.tokens.length - 1] == "") {
      this.tokens.pop();
    }
    if (this.tokens[0] == "") {
      this.tokens.shift();
    }
  };
  var prototypeAccessors$1$2 = {next: {configurable: true}};
  prototypeAccessors$1$2.next.get = function() {
    return this.tokens[this.pos];
  };
  TokenStream.prototype.eat = function eat(tok) {
    return this.next == tok && (this.pos++ || true);
  };
  TokenStream.prototype.err = function err(str) {
    throw new SyntaxError(str + " (in content expression '" + this.string + "')");
  };
  Object.defineProperties(TokenStream.prototype, prototypeAccessors$1$2);
  function parseExpr(stream) {
    var exprs = [];
    do {
      exprs.push(parseExprSeq(stream));
    } while (stream.eat("|"));
    return exprs.length == 1 ? exprs[0] : {type: "choice", exprs};
  }
  function parseExprSeq(stream) {
    var exprs = [];
    do {
      exprs.push(parseExprSubscript(stream));
    } while (stream.next && stream.next != ")" && stream.next != "|");
    return exprs.length == 1 ? exprs[0] : {type: "seq", exprs};
  }
  function parseExprSubscript(stream) {
    var expr = parseExprAtom(stream);
    for (; ; ) {
      if (stream.eat("+")) {
        expr = {type: "plus", expr};
      } else if (stream.eat("*")) {
        expr = {type: "star", expr};
      } else if (stream.eat("?")) {
        expr = {type: "opt", expr};
      } else if (stream.eat("{")) {
        expr = parseExprRange(stream, expr);
      } else {
        break;
      }
    }
    return expr;
  }
  function parseNum(stream) {
    if (/\D/.test(stream.next)) {
      stream.err("Expected number, got '" + stream.next + "'");
    }
    var result2 = Number(stream.next);
    stream.pos++;
    return result2;
  }
  function parseExprRange(stream, expr) {
    var min2 = parseNum(stream), max2 = min2;
    if (stream.eat(",")) {
      if (stream.next != "}") {
        max2 = parseNum(stream);
      } else {
        max2 = -1;
      }
    }
    if (!stream.eat("}")) {
      stream.err("Unclosed braced range");
    }
    return {type: "range", min: min2, max: max2, expr};
  }
  function resolveName(stream, name) {
    var types = stream.nodeTypes, type = types[name];
    if (type) {
      return [type];
    }
    var result2 = [];
    for (var typeName in types) {
      var type$1 = types[typeName];
      if (type$1.groups.indexOf(name) > -1) {
        result2.push(type$1);
      }
    }
    if (result2.length == 0) {
      stream.err("No node type or group '" + name + "' found");
    }
    return result2;
  }
  function parseExprAtom(stream) {
    if (stream.eat("(")) {
      var expr = parseExpr(stream);
      if (!stream.eat(")")) {
        stream.err("Missing closing paren");
      }
      return expr;
    } else if (!/\W/.test(stream.next)) {
      var exprs = resolveName(stream, stream.next).map(function(type) {
        if (stream.inline == null) {
          stream.inline = type.isInline;
        } else if (stream.inline != type.isInline) {
          stream.err("Mixing inline and block content");
        }
        return {type: "name", value: type};
      });
      stream.pos++;
      return exprs.length == 1 ? exprs[0] : {type: "choice", exprs};
    } else {
      stream.err("Unexpected token '" + stream.next + "'");
    }
  }
  function nfa(expr) {
    var nfa2 = [[]];
    connect(compile3(expr, 0), node4());
    return nfa2;
    function node4() {
      return nfa2.push([]) - 1;
    }
    function edge2(from4, to, term) {
      var edge3 = {term, to};
      nfa2[from4].push(edge3);
      return edge3;
    }
    function connect(edges, to) {
      edges.forEach(function(edge3) {
        return edge3.to = to;
      });
    }
    function compile3(expr2, from4) {
      if (expr2.type == "choice") {
        return expr2.exprs.reduce(function(out, expr3) {
          return out.concat(compile3(expr3, from4));
        }, []);
      } else if (expr2.type == "seq") {
        for (var i = 0; ; i++) {
          var next = compile3(expr2.exprs[i], from4);
          if (i == expr2.exprs.length - 1) {
            return next;
          }
          connect(next, from4 = node4());
        }
      } else if (expr2.type == "star") {
        var loop = node4();
        edge2(from4, loop);
        connect(compile3(expr2.expr, loop), loop);
        return [edge2(loop)];
      } else if (expr2.type == "plus") {
        var loop$1 = node4();
        connect(compile3(expr2.expr, from4), loop$1);
        connect(compile3(expr2.expr, loop$1), loop$1);
        return [edge2(loop$1)];
      } else if (expr2.type == "opt") {
        return [edge2(from4)].concat(compile3(expr2.expr, from4));
      } else if (expr2.type == "range") {
        var cur = from4;
        for (var i$1 = 0; i$1 < expr2.min; i$1++) {
          var next$1 = node4();
          connect(compile3(expr2.expr, cur), next$1);
          cur = next$1;
        }
        if (expr2.max == -1) {
          connect(compile3(expr2.expr, cur), cur);
        } else {
          for (var i$2 = expr2.min; i$2 < expr2.max; i$2++) {
            var next$2 = node4();
            edge2(cur, next$2);
            connect(compile3(expr2.expr, cur), next$2);
            cur = next$2;
          }
        }
        return [edge2(cur)];
      } else if (expr2.type == "name") {
        return [edge2(from4, null, expr2.value)];
      }
    }
  }
  function cmp(a, b) {
    return b - a;
  }
  function nullFrom(nfa2, node4) {
    var result2 = [];
    scan(node4);
    return result2.sort(cmp);
    function scan(node5) {
      var edges = nfa2[node5];
      if (edges.length == 1 && !edges[0].term) {
        return scan(edges[0].to);
      }
      result2.push(node5);
      for (var i = 0; i < edges.length; i++) {
        var ref = edges[i];
        var term = ref.term;
        var to = ref.to;
        if (!term && result2.indexOf(to) == -1) {
          scan(to);
        }
      }
    }
  }
  function dfa(nfa2) {
    var labeled = Object.create(null);
    return explore(nullFrom(nfa2, 0));
    function explore(states) {
      var out = [];
      states.forEach(function(node4) {
        nfa2[node4].forEach(function(ref) {
          var term = ref.term;
          var to = ref.to;
          if (!term) {
            return;
          }
          var known = out.indexOf(term), set2 = known > -1 && out[known + 1];
          nullFrom(nfa2, to).forEach(function(node5) {
            if (!set2) {
              out.push(term, set2 = []);
            }
            if (set2.indexOf(node5) == -1) {
              set2.push(node5);
            }
          });
        });
      });
      var state2 = labeled[states.join(",")] = new ContentMatch(states.indexOf(nfa2.length - 1) > -1);
      for (var i = 0; i < out.length; i += 2) {
        var states$1 = out[i + 1].sort(cmp);
        state2.next.push(out[i], labeled[states$1.join(",")] || explore(states$1));
      }
      return state2;
    }
  }
  function checkForDeadEnds(match, stream) {
    for (var i = 0, work = [match]; i < work.length; i++) {
      var state2 = work[i], dead = !state2.validEnd, nodes3 = [];
      for (var j = 0; j < state2.next.length; j += 2) {
        var node4 = state2.next[j], next = state2.next[j + 1];
        nodes3.push(node4.name);
        if (dead && !(node4.isText || node4.hasRequiredAttrs())) {
          dead = false;
        }
        if (work.indexOf(next) == -1) {
          work.push(next);
        }
      }
      if (dead) {
        stream.err("Only non-generatable nodes (" + nodes3.join(", ") + ") in a required position (see https://prosemirror.net/docs/guide/#generatable)");
      }
    }
  }
  function defaultAttrs(attrs) {
    var defaults = Object.create(null);
    for (var attrName in attrs) {
      var attr = attrs[attrName];
      if (!attr.hasDefault) {
        return null;
      }
      defaults[attrName] = attr.default;
    }
    return defaults;
  }
  function computeAttrs(attrs, value) {
    var built = Object.create(null);
    for (var name in attrs) {
      var given = value && value[name];
      if (given === void 0) {
        var attr = attrs[name];
        if (attr.hasDefault) {
          given = attr.default;
        } else {
          throw new RangeError("No value supplied for attribute " + name);
        }
      }
      built[name] = given;
    }
    return built;
  }
  function initAttrs(attrs) {
    var result2 = Object.create(null);
    if (attrs) {
      for (var name in attrs) {
        result2[name] = new Attribute(attrs[name]);
      }
    }
    return result2;
  }
  var NodeType = function NodeType2(name, schema2, spec) {
    this.name = name;
    this.schema = schema2;
    this.spec = spec;
    this.groups = spec.group ? spec.group.split(" ") : [];
    this.attrs = initAttrs(spec.attrs);
    this.defaultAttrs = defaultAttrs(this.attrs);
    this.contentMatch = null;
    this.markSet = null;
    this.inlineContent = null;
    this.isBlock = !(spec.inline || name == "text");
    this.isText = name == "text";
  };
  var prototypeAccessors$5 = {isInline: {configurable: true}, isTextblock: {configurable: true}, isLeaf: {configurable: true}, isAtom: {configurable: true}};
  prototypeAccessors$5.isInline.get = function() {
    return !this.isBlock;
  };
  prototypeAccessors$5.isTextblock.get = function() {
    return this.isBlock && this.inlineContent;
  };
  prototypeAccessors$5.isLeaf.get = function() {
    return this.contentMatch == ContentMatch.empty;
  };
  prototypeAccessors$5.isAtom.get = function() {
    return this.isLeaf || this.spec.atom;
  };
  NodeType.prototype.hasRequiredAttrs = function hasRequiredAttrs() {
    for (var n in this.attrs) {
      if (this.attrs[n].isRequired) {
        return true;
      }
    }
    return false;
  };
  NodeType.prototype.compatibleContent = function compatibleContent(other) {
    return this == other || this.contentMatch.compatible(other.contentMatch);
  };
  NodeType.prototype.computeAttrs = function computeAttrs$1(attrs) {
    if (!attrs && this.defaultAttrs) {
      return this.defaultAttrs;
    } else {
      return computeAttrs(this.attrs, attrs);
    }
  };
  NodeType.prototype.create = function create(attrs, content2, marks4) {
    if (this.isText) {
      throw new Error("NodeType.create can't construct text nodes");
    }
    return new Node(this, this.computeAttrs(attrs), Fragment.from(content2), Mark.setFrom(marks4));
  };
  NodeType.prototype.createChecked = function createChecked(attrs, content2, marks4) {
    content2 = Fragment.from(content2);
    if (!this.validContent(content2)) {
      throw new RangeError("Invalid content for node " + this.name);
    }
    return new Node(this, this.computeAttrs(attrs), content2, Mark.setFrom(marks4));
  };
  NodeType.prototype.createAndFill = function createAndFill(attrs, content2, marks4) {
    attrs = this.computeAttrs(attrs);
    content2 = Fragment.from(content2);
    if (content2.size) {
      var before2 = this.contentMatch.fillBefore(content2);
      if (!before2) {
        return null;
      }
      content2 = before2.append(content2);
    }
    var after2 = this.contentMatch.matchFragment(content2).fillBefore(Fragment.empty, true);
    if (!after2) {
      return null;
    }
    return new Node(this, attrs, content2.append(after2), Mark.setFrom(marks4));
  };
  NodeType.prototype.validContent = function validContent(content2) {
    var result2 = this.contentMatch.matchFragment(content2);
    if (!result2 || !result2.validEnd) {
      return false;
    }
    for (var i = 0; i < content2.childCount; i++) {
      if (!this.allowsMarks(content2.child(i).marks)) {
        return false;
      }
    }
    return true;
  };
  NodeType.prototype.allowsMarkType = function allowsMarkType(markType) {
    return this.markSet == null || this.markSet.indexOf(markType) > -1;
  };
  NodeType.prototype.allowsMarks = function allowsMarks(marks4) {
    if (this.markSet == null) {
      return true;
    }
    for (var i = 0; i < marks4.length; i++) {
      if (!this.allowsMarkType(marks4[i].type)) {
        return false;
      }
    }
    return true;
  };
  NodeType.prototype.allowedMarks = function allowedMarks(marks4) {
    if (this.markSet == null) {
      return marks4;
    }
    var copy5;
    for (var i = 0; i < marks4.length; i++) {
      if (!this.allowsMarkType(marks4[i].type)) {
        if (!copy5) {
          copy5 = marks4.slice(0, i);
        }
      } else if (copy5) {
        copy5.push(marks4[i]);
      }
    }
    return !copy5 ? marks4 : copy5.length ? copy5 : Mark.empty;
  };
  NodeType.compile = function compile(nodes3, schema2) {
    var result2 = Object.create(null);
    nodes3.forEach(function(name, spec) {
      return result2[name] = new NodeType(name, schema2, spec);
    });
    var topType = schema2.spec.topNode || "doc";
    if (!result2[topType]) {
      throw new RangeError("Schema is missing its top node type ('" + topType + "')");
    }
    if (!result2.text) {
      throw new RangeError("Every schema needs a 'text' type");
    }
    for (var _ in result2.text.attrs) {
      throw new RangeError("The text node type should not have attributes");
    }
    return result2;
  };
  Object.defineProperties(NodeType.prototype, prototypeAccessors$5);
  var Attribute = function Attribute2(options) {
    this.hasDefault = Object.prototype.hasOwnProperty.call(options, "default");
    this.default = options.default;
  };
  var prototypeAccessors$1$3 = {isRequired: {configurable: true}};
  prototypeAccessors$1$3.isRequired.get = function() {
    return !this.hasDefault;
  };
  Object.defineProperties(Attribute.prototype, prototypeAccessors$1$3);
  var MarkType = function MarkType2(name, rank, schema2, spec) {
    this.name = name;
    this.schema = schema2;
    this.spec = spec;
    this.attrs = initAttrs(spec.attrs);
    this.rank = rank;
    this.excluded = null;
    var defaults = defaultAttrs(this.attrs);
    this.instance = defaults && new Mark(this, defaults);
  };
  MarkType.prototype.create = function create2(attrs) {
    if (!attrs && this.instance) {
      return this.instance;
    }
    return new Mark(this, computeAttrs(this.attrs, attrs));
  };
  MarkType.compile = function compile2(marks4, schema2) {
    var result2 = Object.create(null), rank = 0;
    marks4.forEach(function(name, spec) {
      return result2[name] = new MarkType(name, rank++, schema2, spec);
    });
    return result2;
  };
  MarkType.prototype.removeFromSet = function removeFromSet2(set2) {
    for (var i = 0; i < set2.length; i++) {
      if (set2[i].type == this) {
        set2 = set2.slice(0, i).concat(set2.slice(i + 1));
        i--;
      }
    }
    return set2;
  };
  MarkType.prototype.isInSet = function isInSet2(set2) {
    for (var i = 0; i < set2.length; i++) {
      if (set2[i].type == this) {
        return set2[i];
      }
    }
  };
  MarkType.prototype.excludes = function excludes(other) {
    return this.excluded.indexOf(other) > -1;
  };
  var Schema = function Schema2(spec) {
    this.spec = {};
    for (var prop in spec) {
      this.spec[prop] = spec[prop];
    }
    this.spec.nodes = index_es_default.from(spec.nodes);
    this.spec.marks = index_es_default.from(spec.marks);
    this.nodes = NodeType.compile(this.spec.nodes, this);
    this.marks = MarkType.compile(this.spec.marks, this);
    var contentExprCache = Object.create(null);
    for (var prop$1 in this.nodes) {
      if (prop$1 in this.marks) {
        throw new RangeError(prop$1 + " can not be both a node and a mark");
      }
      var type = this.nodes[prop$1], contentExpr = type.spec.content || "", markExpr = type.spec.marks;
      type.contentMatch = contentExprCache[contentExpr] || (contentExprCache[contentExpr] = ContentMatch.parse(contentExpr, this.nodes));
      type.inlineContent = type.contentMatch.inlineContent;
      type.markSet = markExpr == "_" ? null : markExpr ? gatherMarks(this, markExpr.split(" ")) : markExpr == "" || !type.inlineContent ? [] : null;
    }
    for (var prop$2 in this.marks) {
      var type$1 = this.marks[prop$2], excl = type$1.spec.excludes;
      type$1.excluded = excl == null ? [type$1] : excl == "" ? [] : gatherMarks(this, excl.split(" "));
    }
    this.nodeFromJSON = this.nodeFromJSON.bind(this);
    this.markFromJSON = this.markFromJSON.bind(this);
    this.topNodeType = this.nodes[this.spec.topNode || "doc"];
    this.cached = Object.create(null);
    this.cached.wrappings = Object.create(null);
  };
  Schema.prototype.node = function node2(type, attrs, content2, marks4) {
    if (typeof type == "string") {
      type = this.nodeType(type);
    } else if (!(type instanceof NodeType)) {
      throw new RangeError("Invalid node type: " + type);
    } else if (type.schema != this) {
      throw new RangeError("Node type from different schema used (" + type.name + ")");
    }
    return type.createChecked(attrs, content2, marks4);
  };
  Schema.prototype.text = function text(text$1, marks4) {
    var type = this.nodes.text;
    return new TextNode(type, type.defaultAttrs, text$1, Mark.setFrom(marks4));
  };
  Schema.prototype.mark = function mark2(type, attrs) {
    if (typeof type == "string") {
      type = this.marks[type];
    }
    return type.create(attrs);
  };
  Schema.prototype.nodeFromJSON = function nodeFromJSON(json) {
    return Node.fromJSON(this, json);
  };
  Schema.prototype.markFromJSON = function markFromJSON(json) {
    return Mark.fromJSON(this, json);
  };
  Schema.prototype.nodeType = function nodeType(name) {
    var found2 = this.nodes[name];
    if (!found2) {
      throw new RangeError("Unknown node type: " + name);
    }
    return found2;
  };
  function gatherMarks(schema2, marks4) {
    var found2 = [];
    for (var i = 0; i < marks4.length; i++) {
      var name = marks4[i], mark3 = schema2.marks[name], ok2 = mark3;
      if (mark3) {
        found2.push(mark3);
      } else {
        for (var prop in schema2.marks) {
          var mark$1 = schema2.marks[prop];
          if (name == "_" || mark$1.spec.group && mark$1.spec.group.split(" ").indexOf(name) > -1) {
            found2.push(ok2 = mark$1);
          }
        }
      }
      if (!ok2) {
        throw new SyntaxError("Unknown mark type: '" + marks4[i] + "'");
      }
    }
    return found2;
  }
  var DOMParser = function DOMParser2(schema2, rules) {
    var this$1 = this;
    this.schema = schema2;
    this.rules = rules;
    this.tags = [];
    this.styles = [];
    rules.forEach(function(rule) {
      if (rule.tag) {
        this$1.tags.push(rule);
      } else if (rule.style) {
        this$1.styles.push(rule);
      }
    });
    this.normalizeLists = !this.tags.some(function(r) {
      if (!/^(ul|ol)\b/.test(r.tag) || !r.node) {
        return false;
      }
      var node4 = schema2.nodes[r.node];
      return node4.contentMatch.matchType(node4);
    });
  };
  DOMParser.prototype.parse = function parse2(dom, options) {
    if (options === void 0)
      options = {};
    var context = new ParseContext(this, options, false);
    context.addAll(dom, null, options.from, options.to);
    return context.finish();
  };
  DOMParser.prototype.parseSlice = function parseSlice(dom, options) {
    if (options === void 0)
      options = {};
    var context = new ParseContext(this, options, true);
    context.addAll(dom, null, options.from, options.to);
    return Slice.maxOpen(context.finish());
  };
  DOMParser.prototype.matchTag = function matchTag(dom, context, after2) {
    for (var i = after2 ? this.tags.indexOf(after2) + 1 : 0; i < this.tags.length; i++) {
      var rule = this.tags[i];
      if (matches(dom, rule.tag) && (rule.namespace === void 0 || dom.namespaceURI == rule.namespace) && (!rule.context || context.matchesContext(rule.context))) {
        if (rule.getAttrs) {
          var result2 = rule.getAttrs(dom);
          if (result2 === false) {
            continue;
          }
          rule.attrs = result2;
        }
        return rule;
      }
    }
  };
  DOMParser.prototype.matchStyle = function matchStyle(prop, value, context, after2) {
    for (var i = after2 ? this.styles.indexOf(after2) + 1 : 0; i < this.styles.length; i++) {
      var rule = this.styles[i];
      if (rule.style.indexOf(prop) != 0 || rule.context && !context.matchesContext(rule.context) || rule.style.length > prop.length && (rule.style.charCodeAt(prop.length) != 61 || rule.style.slice(prop.length + 1) != value)) {
        continue;
      }
      if (rule.getAttrs) {
        var result2 = rule.getAttrs(value);
        if (result2 === false) {
          continue;
        }
        rule.attrs = result2;
      }
      return rule;
    }
  };
  DOMParser.schemaRules = function schemaRules(schema2) {
    var result2 = [];
    function insert(rule) {
      var priority = rule.priority == null ? 50 : rule.priority, i = 0;
      for (; i < result2.length; i++) {
        var next = result2[i], nextPriority = next.priority == null ? 50 : next.priority;
        if (nextPriority < priority) {
          break;
        }
      }
      result2.splice(i, 0, rule);
    }
    var loop = function(name2) {
      var rules = schema2.marks[name2].spec.parseDOM;
      if (rules) {
        rules.forEach(function(rule) {
          insert(rule = copy2(rule));
          rule.mark = name2;
        });
      }
    };
    for (var name in schema2.marks)
      loop(name);
    var loop$1 = function(name2) {
      var rules$1 = schema2.nodes[name$1].spec.parseDOM;
      if (rules$1) {
        rules$1.forEach(function(rule) {
          insert(rule = copy2(rule));
          rule.node = name$1;
        });
      }
    };
    for (var name$1 in schema2.nodes)
      loop$1();
    return result2;
  };
  DOMParser.fromSchema = function fromSchema(schema2) {
    return schema2.cached.domParser || (schema2.cached.domParser = new DOMParser(schema2, DOMParser.schemaRules(schema2)));
  };
  var blockTags = {
    address: true,
    article: true,
    aside: true,
    blockquote: true,
    canvas: true,
    dd: true,
    div: true,
    dl: true,
    fieldset: true,
    figcaption: true,
    figure: true,
    footer: true,
    form: true,
    h1: true,
    h2: true,
    h3: true,
    h4: true,
    h5: true,
    h6: true,
    header: true,
    hgroup: true,
    hr: true,
    li: true,
    noscript: true,
    ol: true,
    output: true,
    p: true,
    pre: true,
    section: true,
    table: true,
    tfoot: true,
    ul: true
  };
  var ignoreTags = {
    head: true,
    noscript: true,
    object: true,
    script: true,
    style: true,
    title: true
  };
  var listTags = {ol: true, ul: true};
  var OPT_PRESERVE_WS = 1;
  var OPT_PRESERVE_WS_FULL = 2;
  var OPT_OPEN_LEFT = 4;
  function wsOptionsFor(preserveWhitespace) {
    return (preserveWhitespace ? OPT_PRESERVE_WS : 0) | (preserveWhitespace === "full" ? OPT_PRESERVE_WS_FULL : 0);
  }
  var NodeContext = function NodeContext2(type, attrs, marks4, pendingMarks, solid, match, options) {
    this.type = type;
    this.attrs = attrs;
    this.solid = solid;
    this.match = match || (options & OPT_OPEN_LEFT ? null : type.contentMatch);
    this.options = options;
    this.content = [];
    this.marks = marks4;
    this.activeMarks = Mark.none;
    this.pendingMarks = pendingMarks;
    this.stashMarks = [];
  };
  NodeContext.prototype.findWrapping = function findWrapping2(node4) {
    if (!this.match) {
      if (!this.type) {
        return [];
      }
      var fill = this.type.contentMatch.fillBefore(Fragment.from(node4));
      if (fill) {
        this.match = this.type.contentMatch.matchFragment(fill);
      } else {
        var start3 = this.type.contentMatch, wrap;
        if (wrap = start3.findWrapping(node4.type)) {
          this.match = start3;
          return wrap;
        } else {
          return null;
        }
      }
    }
    return this.match.findWrapping(node4.type);
  };
  NodeContext.prototype.finish = function finish(openEnd) {
    if (!(this.options & OPT_PRESERVE_WS)) {
      var last = this.content[this.content.length - 1], m;
      if (last && last.isText && (m = /[ \t\r\n\u000c]+$/.exec(last.text))) {
        if (last.text.length == m[0].length) {
          this.content.pop();
        } else {
          this.content[this.content.length - 1] = last.withText(last.text.slice(0, last.text.length - m[0].length));
        }
      }
    }
    var content2 = Fragment.from(this.content);
    if (!openEnd && this.match) {
      content2 = content2.append(this.match.fillBefore(Fragment.empty, true));
    }
    return this.type ? this.type.create(this.attrs, content2, this.marks) : content2;
  };
  NodeContext.prototype.popFromStashMark = function popFromStashMark(mark3) {
    for (var i = this.stashMarks.length - 1; i >= 0; i--) {
      if (mark3.eq(this.stashMarks[i])) {
        return this.stashMarks.splice(i, 1)[0];
      }
    }
  };
  NodeContext.prototype.applyPending = function applyPending(nextType) {
    for (var i = 0, pending = this.pendingMarks; i < pending.length; i++) {
      var mark3 = pending[i];
      if ((this.type ? this.type.allowsMarkType(mark3.type) : markMayApply(mark3.type, nextType)) && !mark3.isInSet(this.activeMarks)) {
        this.activeMarks = mark3.addToSet(this.activeMarks);
        this.pendingMarks = mark3.removeFromSet(this.pendingMarks);
      }
    }
  };
  NodeContext.prototype.inlineContext = function inlineContext(node4) {
    if (this.type) {
      return this.type.inlineContent;
    }
    if (this.content.length) {
      return this.content[0].isInline;
    }
    return node4.parentNode && !blockTags.hasOwnProperty(node4.parentNode.nodeName.toLowerCase());
  };
  var ParseContext = function ParseContext2(parser, options, open) {
    this.parser = parser;
    this.options = options;
    this.isOpen = open;
    var topNode = options.topNode, topContext;
    var topOptions = wsOptionsFor(options.preserveWhitespace) | (open ? OPT_OPEN_LEFT : 0);
    if (topNode) {
      topContext = new NodeContext(topNode.type, topNode.attrs, Mark.none, Mark.none, true, options.topMatch || topNode.type.contentMatch, topOptions);
    } else if (open) {
      topContext = new NodeContext(null, null, Mark.none, Mark.none, true, null, topOptions);
    } else {
      topContext = new NodeContext(parser.schema.topNodeType, null, Mark.none, Mark.none, true, null, topOptions);
    }
    this.nodes = [topContext];
    this.open = 0;
    this.find = options.findPositions;
    this.needsBlock = false;
  };
  var prototypeAccessors$6 = {top: {configurable: true}, currentPos: {configurable: true}};
  prototypeAccessors$6.top.get = function() {
    return this.nodes[this.open];
  };
  ParseContext.prototype.addDOM = function addDOM(dom) {
    if (dom.nodeType == 3) {
      this.addTextNode(dom);
    } else if (dom.nodeType == 1) {
      var style = dom.getAttribute("style");
      var marks4 = style ? this.readStyles(parseStyles(style)) : null, top = this.top;
      if (marks4 != null) {
        for (var i = 0; i < marks4.length; i++) {
          this.addPendingMark(marks4[i]);
        }
      }
      this.addElement(dom);
      if (marks4 != null) {
        for (var i$1 = 0; i$1 < marks4.length; i$1++) {
          this.removePendingMark(marks4[i$1], top);
        }
      }
    }
  };
  ParseContext.prototype.addTextNode = function addTextNode(dom) {
    var value = dom.nodeValue;
    var top = this.top;
    if (top.options & OPT_PRESERVE_WS_FULL || top.inlineContext(dom) || /[^ \t\r\n\u000c]/.test(value)) {
      if (!(top.options & OPT_PRESERVE_WS)) {
        value = value.replace(/[ \t\r\n\u000c]+/g, " ");
        if (/^[ \t\r\n\u000c]/.test(value) && this.open == this.nodes.length - 1) {
          var nodeBefore = top.content[top.content.length - 1];
          var domNodeBefore = dom.previousSibling;
          if (!nodeBefore || domNodeBefore && domNodeBefore.nodeName == "BR" || nodeBefore.isText && /[ \t\r\n\u000c]$/.test(nodeBefore.text)) {
            value = value.slice(1);
          }
        }
      } else if (!(top.options & OPT_PRESERVE_WS_FULL)) {
        value = value.replace(/\r?\n|\r/g, " ");
      } else {
        value = value.replace(/\r\n?/g, "\n");
      }
      if (value) {
        this.insertNode(this.parser.schema.text(value));
      }
      this.findInText(dom);
    } else {
      this.findInside(dom);
    }
  };
  ParseContext.prototype.addElement = function addElement(dom, matchAfter) {
    var name = dom.nodeName.toLowerCase(), ruleID;
    if (listTags.hasOwnProperty(name) && this.parser.normalizeLists) {
      normalizeList(dom);
    }
    var rule = this.options.ruleFromNode && this.options.ruleFromNode(dom) || (ruleID = this.parser.matchTag(dom, this, matchAfter));
    if (rule ? rule.ignore : ignoreTags.hasOwnProperty(name)) {
      this.findInside(dom);
      this.ignoreFallback(dom);
    } else if (!rule || rule.skip || rule.closeParent) {
      if (rule && rule.closeParent) {
        this.open = Math.max(0, this.open - 1);
      } else if (rule && rule.skip.nodeType) {
        dom = rule.skip;
      }
      var sync2, top = this.top, oldNeedsBlock = this.needsBlock;
      if (blockTags.hasOwnProperty(name)) {
        sync2 = true;
        if (!top.type) {
          this.needsBlock = true;
        }
      } else if (!dom.firstChild) {
        this.leafFallback(dom);
        return;
      }
      this.addAll(dom);
      if (sync2) {
        this.sync(top);
      }
      this.needsBlock = oldNeedsBlock;
    } else {
      this.addElementByRule(dom, rule, rule.consuming === false ? ruleID : null);
    }
  };
  ParseContext.prototype.leafFallback = function leafFallback(dom) {
    if (dom.nodeName == "BR" && this.top.type && this.top.type.inlineContent) {
      this.addTextNode(dom.ownerDocument.createTextNode("\n"));
    }
  };
  ParseContext.prototype.ignoreFallback = function ignoreFallback(dom) {
    if (dom.nodeName == "BR" && (!this.top.type || !this.top.type.inlineContent)) {
      this.findPlace(this.parser.schema.text("-"));
    }
  };
  ParseContext.prototype.readStyles = function readStyles(styles) {
    var marks4 = Mark.none;
    style:
      for (var i = 0; i < styles.length; i += 2) {
        for (var after2 = null; ; ) {
          var rule = this.parser.matchStyle(styles[i], styles[i + 1], this, after2);
          if (!rule) {
            continue style;
          }
          if (rule.ignore) {
            return null;
          }
          marks4 = this.parser.schema.marks[rule.mark].create(rule.attrs).addToSet(marks4);
          if (rule.consuming === false) {
            after2 = rule;
          } else {
            break;
          }
        }
      }
    return marks4;
  };
  ParseContext.prototype.addElementByRule = function addElementByRule(dom, rule, continueAfter) {
    var this$1 = this;
    var sync2, nodeType2, markType, mark3;
    if (rule.node) {
      nodeType2 = this.parser.schema.nodes[rule.node];
      if (!nodeType2.isLeaf) {
        sync2 = this.enter(nodeType2, rule.attrs, rule.preserveWhitespace);
      } else if (!this.insertNode(nodeType2.create(rule.attrs))) {
        this.leafFallback(dom);
      }
    } else {
      markType = this.parser.schema.marks[rule.mark];
      mark3 = markType.create(rule.attrs);
      this.addPendingMark(mark3);
    }
    var startIn = this.top;
    if (nodeType2 && nodeType2.isLeaf) {
      this.findInside(dom);
    } else if (continueAfter) {
      this.addElement(dom, continueAfter);
    } else if (rule.getContent) {
      this.findInside(dom);
      rule.getContent(dom, this.parser.schema).forEach(function(node4) {
        return this$1.insertNode(node4);
      });
    } else {
      var contentDOM = rule.contentElement;
      if (typeof contentDOM == "string") {
        contentDOM = dom.querySelector(contentDOM);
      } else if (typeof contentDOM == "function") {
        contentDOM = contentDOM(dom);
      }
      if (!contentDOM) {
        contentDOM = dom;
      }
      this.findAround(dom, contentDOM, true);
      this.addAll(contentDOM, sync2);
    }
    if (sync2) {
      this.sync(startIn);
      this.open--;
    }
    if (mark3) {
      this.removePendingMark(mark3, startIn);
    }
  };
  ParseContext.prototype.addAll = function addAll(parent, sync2, startIndex, endIndex) {
    var index2 = startIndex || 0;
    for (var dom = startIndex ? parent.childNodes[startIndex] : parent.firstChild, end2 = endIndex == null ? null : parent.childNodes[endIndex]; dom != end2; dom = dom.nextSibling, ++index2) {
      this.findAtPoint(parent, index2);
      this.addDOM(dom);
      if (sync2 && blockTags.hasOwnProperty(dom.nodeName.toLowerCase())) {
        this.sync(sync2);
      }
    }
    this.findAtPoint(parent, index2);
  };
  ParseContext.prototype.findPlace = function findPlace(node4) {
    var route, sync2;
    for (var depth = this.open; depth >= 0; depth--) {
      var cx = this.nodes[depth];
      var found2 = cx.findWrapping(node4);
      if (found2 && (!route || route.length > found2.length)) {
        route = found2;
        sync2 = cx;
        if (!found2.length) {
          break;
        }
      }
      if (cx.solid) {
        break;
      }
    }
    if (!route) {
      return false;
    }
    this.sync(sync2);
    for (var i = 0; i < route.length; i++) {
      this.enterInner(route[i], null, false);
    }
    return true;
  };
  ParseContext.prototype.insertNode = function insertNode(node4) {
    if (node4.isInline && this.needsBlock && !this.top.type) {
      var block = this.textblockFromContext();
      if (block) {
        this.enterInner(block);
      }
    }
    if (this.findPlace(node4)) {
      this.closeExtra();
      var top = this.top;
      top.applyPending(node4.type);
      if (top.match) {
        top.match = top.match.matchType(node4.type);
      }
      var marks4 = top.activeMarks;
      for (var i = 0; i < node4.marks.length; i++) {
        if (!top.type || top.type.allowsMarkType(node4.marks[i].type)) {
          marks4 = node4.marks[i].addToSet(marks4);
        }
      }
      top.content.push(node4.mark(marks4));
      return true;
    }
    return false;
  };
  ParseContext.prototype.enter = function enter(type, attrs, preserveWS) {
    var ok2 = this.findPlace(type.create(attrs));
    if (ok2) {
      this.enterInner(type, attrs, true, preserveWS);
    }
    return ok2;
  };
  ParseContext.prototype.enterInner = function enterInner(type, attrs, solid, preserveWS) {
    this.closeExtra();
    var top = this.top;
    top.applyPending(type);
    top.match = top.match && top.match.matchType(type, attrs);
    var options = preserveWS == null ? top.options & ~OPT_OPEN_LEFT : wsOptionsFor(preserveWS);
    if (top.options & OPT_OPEN_LEFT && top.content.length == 0) {
      options |= OPT_OPEN_LEFT;
    }
    this.nodes.push(new NodeContext(type, attrs, top.activeMarks, top.pendingMarks, solid, null, options));
    this.open++;
  };
  ParseContext.prototype.closeExtra = function closeExtra(openEnd) {
    var i = this.nodes.length - 1;
    if (i > this.open) {
      for (; i > this.open; i--) {
        this.nodes[i - 1].content.push(this.nodes[i].finish(openEnd));
      }
      this.nodes.length = this.open + 1;
    }
  };
  ParseContext.prototype.finish = function finish2() {
    this.open = 0;
    this.closeExtra(this.isOpen);
    return this.nodes[0].finish(this.isOpen || this.options.topOpen);
  };
  ParseContext.prototype.sync = function sync(to) {
    for (var i = this.open; i >= 0; i--) {
      if (this.nodes[i] == to) {
        this.open = i;
        return;
      }
    }
  };
  prototypeAccessors$6.currentPos.get = function() {
    this.closeExtra();
    var pos = 0;
    for (var i = this.open; i >= 0; i--) {
      var content2 = this.nodes[i].content;
      for (var j = content2.length - 1; j >= 0; j--) {
        pos += content2[j].nodeSize;
      }
      if (i) {
        pos++;
      }
    }
    return pos;
  };
  ParseContext.prototype.findAtPoint = function findAtPoint(parent, offset2) {
    if (this.find) {
      for (var i = 0; i < this.find.length; i++) {
        if (this.find[i].node == parent && this.find[i].offset == offset2) {
          this.find[i].pos = this.currentPos;
        }
      }
    }
  };
  ParseContext.prototype.findInside = function findInside(parent) {
    if (this.find) {
      for (var i = 0; i < this.find.length; i++) {
        if (this.find[i].pos == null && parent.nodeType == 1 && parent.contains(this.find[i].node)) {
          this.find[i].pos = this.currentPos;
        }
      }
    }
  };
  ParseContext.prototype.findAround = function findAround(parent, content2, before2) {
    if (parent != content2 && this.find) {
      for (var i = 0; i < this.find.length; i++) {
        if (this.find[i].pos == null && parent.nodeType == 1 && parent.contains(this.find[i].node)) {
          var pos = content2.compareDocumentPosition(this.find[i].node);
          if (pos & (before2 ? 2 : 4)) {
            this.find[i].pos = this.currentPos;
          }
        }
      }
    }
  };
  ParseContext.prototype.findInText = function findInText(textNode) {
    if (this.find) {
      for (var i = 0; i < this.find.length; i++) {
        if (this.find[i].node == textNode) {
          this.find[i].pos = this.currentPos - (textNode.nodeValue.length - this.find[i].offset);
        }
      }
    }
  };
  ParseContext.prototype.matchesContext = function matchesContext(context) {
    var this$1 = this;
    if (context.indexOf("|") > -1) {
      return context.split(/\s*\|\s*/).some(this.matchesContext, this);
    }
    var parts = context.split("/");
    var option = this.options.context;
    var useRoot = !this.isOpen && (!option || option.parent.type == this.nodes[0].type);
    var minDepth = -(option ? option.depth + 1 : 0) + (useRoot ? 0 : 1);
    var match = function(i, depth) {
      for (; i >= 0; i--) {
        var part = parts[i];
        if (part == "") {
          if (i == parts.length - 1 || i == 0) {
            continue;
          }
          for (; depth >= minDepth; depth--) {
            if (match(i - 1, depth)) {
              return true;
            }
          }
          return false;
        } else {
          var next = depth > 0 || depth == 0 && useRoot ? this$1.nodes[depth].type : option && depth >= minDepth ? option.node(depth - minDepth).type : null;
          if (!next || next.name != part && next.groups.indexOf(part) == -1) {
            return false;
          }
          depth--;
        }
      }
      return true;
    };
    return match(parts.length - 1, this.open);
  };
  ParseContext.prototype.textblockFromContext = function textblockFromContext() {
    var $context = this.options.context;
    if ($context) {
      for (var d = $context.depth; d >= 0; d--) {
        var deflt = $context.node(d).contentMatchAt($context.indexAfter(d)).defaultType;
        if (deflt && deflt.isTextblock && deflt.defaultAttrs) {
          return deflt;
        }
      }
    }
    for (var name in this.parser.schema.nodes) {
      var type = this.parser.schema.nodes[name];
      if (type.isTextblock && type.defaultAttrs) {
        return type;
      }
    }
  };
  ParseContext.prototype.addPendingMark = function addPendingMark(mark3) {
    var found2 = findSameMarkInSet(mark3, this.top.pendingMarks);
    if (found2) {
      this.top.stashMarks.push(found2);
    }
    this.top.pendingMarks = mark3.addToSet(this.top.pendingMarks);
  };
  ParseContext.prototype.removePendingMark = function removePendingMark(mark3, upto) {
    for (var depth = this.open; depth >= 0; depth--) {
      var level = this.nodes[depth];
      var found2 = level.pendingMarks.lastIndexOf(mark3);
      if (found2 > -1) {
        level.pendingMarks = mark3.removeFromSet(level.pendingMarks);
      } else {
        level.activeMarks = mark3.removeFromSet(level.activeMarks);
        var stashMark = level.popFromStashMark(mark3);
        if (stashMark && level.type && level.type.allowsMarkType(stashMark.type)) {
          level.activeMarks = stashMark.addToSet(level.activeMarks);
        }
      }
      if (level == upto) {
        break;
      }
    }
  };
  Object.defineProperties(ParseContext.prototype, prototypeAccessors$6);
  function normalizeList(dom) {
    for (var child3 = dom.firstChild, prevItem = null; child3; child3 = child3.nextSibling) {
      var name = child3.nodeType == 1 ? child3.nodeName.toLowerCase() : null;
      if (name && listTags.hasOwnProperty(name) && prevItem) {
        prevItem.appendChild(child3);
        child3 = prevItem;
      } else if (name == "li") {
        prevItem = child3;
      } else if (name) {
        prevItem = null;
      }
    }
  }
  function matches(dom, selector) {
    return (dom.matches || dom.msMatchesSelector || dom.webkitMatchesSelector || dom.mozMatchesSelector).call(dom, selector);
  }
  function parseStyles(style) {
    var re = /\s*([\w-]+)\s*:\s*([^;]+)/g, m, result2 = [];
    while (m = re.exec(style)) {
      result2.push(m[1], m[2].trim());
    }
    return result2;
  }
  function copy2(obj) {
    var copy5 = {};
    for (var prop in obj) {
      copy5[prop] = obj[prop];
    }
    return copy5;
  }
  function markMayApply(markType, nodeType2) {
    var nodes3 = nodeType2.schema.nodes;
    var loop = function(name2) {
      var parent = nodes3[name2];
      if (!parent.allowsMarkType(markType)) {
        return;
      }
      var seen = [], scan = function(match) {
        seen.push(match);
        for (var i = 0; i < match.edgeCount; i++) {
          var ref = match.edge(i);
          var type = ref.type;
          var next = ref.next;
          if (type == nodeType2) {
            return true;
          }
          if (seen.indexOf(next) < 0 && scan(next)) {
            return true;
          }
        }
      };
      if (scan(parent.contentMatch)) {
        return {v: true};
      }
    };
    for (var name in nodes3) {
      var returned = loop(name);
      if (returned)
        return returned.v;
    }
  }
  function findSameMarkInSet(mark3, set2) {
    for (var i = 0; i < set2.length; i++) {
      if (mark3.eq(set2[i])) {
        return set2[i];
      }
    }
  }
  var DOMSerializer = function DOMSerializer2(nodes3, marks4) {
    this.nodes = nodes3 || {};
    this.marks = marks4 || {};
  };
  DOMSerializer.prototype.serializeFragment = function serializeFragment(fragment, options, target) {
    var this$1 = this;
    if (options === void 0)
      options = {};
    if (!target) {
      target = doc(options).createDocumentFragment();
    }
    var top = target, active = null;
    fragment.forEach(function(node4) {
      if (active || node4.marks.length) {
        if (!active) {
          active = [];
        }
        var keep = 0, rendered = 0;
        while (keep < active.length && rendered < node4.marks.length) {
          var next = node4.marks[rendered];
          if (!this$1.marks[next.type.name]) {
            rendered++;
            continue;
          }
          if (!next.eq(active[keep]) || next.type.spec.spanning === false) {
            break;
          }
          keep += 2;
          rendered++;
        }
        while (keep < active.length) {
          top = active.pop();
          active.pop();
        }
        while (rendered < node4.marks.length) {
          var add2 = node4.marks[rendered++];
          var markDOM = this$1.serializeMark(add2, node4.isInline, options);
          if (markDOM) {
            active.push(add2, top);
            top.appendChild(markDOM.dom);
            top = markDOM.contentDOM || markDOM.dom;
          }
        }
      }
      top.appendChild(this$1.serializeNodeInner(node4, options));
    });
    return target;
  };
  DOMSerializer.prototype.serializeNodeInner = function serializeNodeInner(node4, options) {
    if (options === void 0)
      options = {};
    var ref = DOMSerializer.renderSpec(doc(options), this.nodes[node4.type.name](node4));
    var dom = ref.dom;
    var contentDOM = ref.contentDOM;
    if (contentDOM) {
      if (node4.isLeaf) {
        throw new RangeError("Content hole not allowed in a leaf node spec");
      }
      if (options.onContent) {
        options.onContent(node4, contentDOM, options);
      } else {
        this.serializeFragment(node4.content, options, contentDOM);
      }
    }
    return dom;
  };
  DOMSerializer.prototype.serializeNode = function serializeNode(node4, options) {
    if (options === void 0)
      options = {};
    var dom = this.serializeNodeInner(node4, options);
    for (var i = node4.marks.length - 1; i >= 0; i--) {
      var wrap = this.serializeMark(node4.marks[i], node4.isInline, options);
      if (wrap) {
        (wrap.contentDOM || wrap.dom).appendChild(dom);
        dom = wrap.dom;
      }
    }
    return dom;
  };
  DOMSerializer.prototype.serializeMark = function serializeMark(mark3, inline2, options) {
    if (options === void 0)
      options = {};
    var toDOM = this.marks[mark3.type.name];
    return toDOM && DOMSerializer.renderSpec(doc(options), toDOM(mark3, inline2));
  };
  DOMSerializer.renderSpec = function renderSpec(doc2, structure, xmlNS) {
    if (xmlNS === void 0)
      xmlNS = null;
    if (typeof structure == "string") {
      return {dom: doc2.createTextNode(structure)};
    }
    if (structure.nodeType != null) {
      return {dom: structure};
    }
    if (structure.dom && structure.dom.nodeType != null) {
      return structure;
    }
    var tagName = structure[0], space = tagName.indexOf(" ");
    if (space > 0) {
      xmlNS = tagName.slice(0, space);
      tagName = tagName.slice(space + 1);
    }
    var contentDOM = null, dom = xmlNS ? doc2.createElementNS(xmlNS, tagName) : doc2.createElement(tagName);
    var attrs = structure[1], start3 = 1;
    if (attrs && typeof attrs == "object" && attrs.nodeType == null && !Array.isArray(attrs)) {
      start3 = 2;
      for (var name in attrs) {
        if (attrs[name] != null) {
          var space$1 = name.indexOf(" ");
          if (space$1 > 0) {
            dom.setAttributeNS(name.slice(0, space$1), name.slice(space$1 + 1), attrs[name]);
          } else {
            dom.setAttribute(name, attrs[name]);
          }
        }
      }
    }
    for (var i = start3; i < structure.length; i++) {
      var child3 = structure[i];
      if (child3 === 0) {
        if (i < structure.length - 1 || i > start3) {
          throw new RangeError("Content hole must be the only child of its parent node");
        }
        return {dom, contentDOM: dom};
      } else {
        var ref = DOMSerializer.renderSpec(doc2, child3, xmlNS);
        var inner = ref.dom;
        var innerContent = ref.contentDOM;
        dom.appendChild(inner);
        if (innerContent) {
          if (contentDOM) {
            throw new RangeError("Multiple content holes");
          }
          contentDOM = innerContent;
        }
      }
    }
    return {dom, contentDOM};
  };
  DOMSerializer.fromSchema = function fromSchema2(schema2) {
    return schema2.cached.domSerializer || (schema2.cached.domSerializer = new DOMSerializer(this.nodesFromSchema(schema2), this.marksFromSchema(schema2)));
  };
  DOMSerializer.nodesFromSchema = function nodesFromSchema(schema2) {
    var result2 = gatherToDOM(schema2.nodes);
    if (!result2.text) {
      result2.text = function(node4) {
        return node4.text;
      };
    }
    return result2;
  };
  DOMSerializer.marksFromSchema = function marksFromSchema(schema2) {
    return gatherToDOM(schema2.marks);
  };
  function gatherToDOM(obj) {
    var result2 = {};
    for (var name in obj) {
      var toDOM = obj[name].spec.toDOM;
      if (toDOM) {
        result2[name] = toDOM;
      }
    }
    return result2;
  }
  function doc(options) {
    return options.document || window.document;
  }

  // node_modules/prosemirror-transform/dist/index.es.js
  var lower16 = 65535;
  var factor16 = Math.pow(2, 16);
  function makeRecover(index2, offset2) {
    return index2 + offset2 * factor16;
  }
  function recoverIndex(value) {
    return value & lower16;
  }
  function recoverOffset(value) {
    return (value - (value & lower16)) / factor16;
  }
  var MapResult = function MapResult2(pos, deleted, recover2) {
    if (deleted === void 0)
      deleted = false;
    if (recover2 === void 0)
      recover2 = null;
    this.pos = pos;
    this.deleted = deleted;
    this.recover = recover2;
  };
  var StepMap = function StepMap2(ranges, inverted) {
    if (inverted === void 0)
      inverted = false;
    this.ranges = ranges;
    this.inverted = inverted;
  };
  StepMap.prototype.recover = function recover(value) {
    var diff = 0, index2 = recoverIndex(value);
    if (!this.inverted) {
      for (var i = 0; i < index2; i++) {
        diff += this.ranges[i * 3 + 2] - this.ranges[i * 3 + 1];
      }
    }
    return this.ranges[index2 * 3] + diff + recoverOffset(value);
  };
  StepMap.prototype.mapResult = function mapResult(pos, assoc) {
    if (assoc === void 0)
      assoc = 1;
    return this._map(pos, assoc, false);
  };
  StepMap.prototype.map = function map(pos, assoc) {
    if (assoc === void 0)
      assoc = 1;
    return this._map(pos, assoc, true);
  };
  StepMap.prototype._map = function _map(pos, assoc, simple) {
    var diff = 0, oldIndex = this.inverted ? 2 : 1, newIndex = this.inverted ? 1 : 2;
    for (var i = 0; i < this.ranges.length; i += 3) {
      var start3 = this.ranges[i] - (this.inverted ? diff : 0);
      if (start3 > pos) {
        break;
      }
      var oldSize = this.ranges[i + oldIndex], newSize = this.ranges[i + newIndex], end2 = start3 + oldSize;
      if (pos <= end2) {
        var side = !oldSize ? assoc : pos == start3 ? -1 : pos == end2 ? 1 : assoc;
        var result2 = start3 + diff + (side < 0 ? 0 : newSize);
        if (simple) {
          return result2;
        }
        var recover2 = pos == (assoc < 0 ? start3 : end2) ? null : makeRecover(i / 3, pos - start3);
        return new MapResult(result2, assoc < 0 ? pos != start3 : pos != end2, recover2);
      }
      diff += newSize - oldSize;
    }
    return simple ? pos + diff : new MapResult(pos + diff);
  };
  StepMap.prototype.touches = function touches(pos, recover2) {
    var diff = 0, index2 = recoverIndex(recover2);
    var oldIndex = this.inverted ? 2 : 1, newIndex = this.inverted ? 1 : 2;
    for (var i = 0; i < this.ranges.length; i += 3) {
      var start3 = this.ranges[i] - (this.inverted ? diff : 0);
      if (start3 > pos) {
        break;
      }
      var oldSize = this.ranges[i + oldIndex], end2 = start3 + oldSize;
      if (pos <= end2 && i == index2 * 3) {
        return true;
      }
      diff += this.ranges[i + newIndex] - oldSize;
    }
    return false;
  };
  StepMap.prototype.forEach = function forEach3(f) {
    var oldIndex = this.inverted ? 2 : 1, newIndex = this.inverted ? 1 : 2;
    for (var i = 0, diff = 0; i < this.ranges.length; i += 3) {
      var start3 = this.ranges[i], oldStart = start3 - (this.inverted ? diff : 0), newStart = start3 + (this.inverted ? 0 : diff);
      var oldSize = this.ranges[i + oldIndex], newSize = this.ranges[i + newIndex];
      f(oldStart, oldStart + oldSize, newStart, newStart + newSize);
      diff += newSize - oldSize;
    }
  };
  StepMap.prototype.invert = function invert() {
    return new StepMap(this.ranges, !this.inverted);
  };
  StepMap.prototype.toString = function toString6() {
    return (this.inverted ? "-" : "") + JSON.stringify(this.ranges);
  };
  StepMap.offset = function offset(n) {
    return n == 0 ? StepMap.empty : new StepMap(n < 0 ? [0, -n, 0] : [0, 0, n]);
  };
  StepMap.empty = new StepMap([]);
  var Mapping = function Mapping2(maps, mirror, from4, to) {
    this.maps = maps || [];
    this.from = from4 || 0;
    this.to = to == null ? this.maps.length : to;
    this.mirror = mirror;
  };
  Mapping.prototype.slice = function slice2(from4, to) {
    if (from4 === void 0)
      from4 = 0;
    if (to === void 0)
      to = this.maps.length;
    return new Mapping(this.maps, this.mirror, from4, to);
  };
  Mapping.prototype.copy = function copy3() {
    return new Mapping(this.maps.slice(), this.mirror && this.mirror.slice(), this.from, this.to);
  };
  Mapping.prototype.appendMap = function appendMap(map14, mirrors) {
    this.to = this.maps.push(map14);
    if (mirrors != null) {
      this.setMirror(this.maps.length - 1, mirrors);
    }
  };
  Mapping.prototype.appendMapping = function appendMapping(mapping) {
    for (var i = 0, startSize = this.maps.length; i < mapping.maps.length; i++) {
      var mirr = mapping.getMirror(i);
      this.appendMap(mapping.maps[i], mirr != null && mirr < i ? startSize + mirr : null);
    }
  };
  Mapping.prototype.getMirror = function getMirror(n) {
    if (this.mirror) {
      for (var i = 0; i < this.mirror.length; i++) {
        if (this.mirror[i] == n) {
          return this.mirror[i + (i % 2 ? -1 : 1)];
        }
      }
    }
  };
  Mapping.prototype.setMirror = function setMirror(n, m) {
    if (!this.mirror) {
      this.mirror = [];
    }
    this.mirror.push(n, m);
  };
  Mapping.prototype.appendMappingInverted = function appendMappingInverted(mapping) {
    for (var i = mapping.maps.length - 1, totalSize = this.maps.length + mapping.maps.length; i >= 0; i--) {
      var mirr = mapping.getMirror(i);
      this.appendMap(mapping.maps[i].invert(), mirr != null && mirr > i ? totalSize - mirr - 1 : null);
    }
  };
  Mapping.prototype.invert = function invert2() {
    var inverse = new Mapping();
    inverse.appendMappingInverted(this);
    return inverse;
  };
  Mapping.prototype.map = function map2(pos, assoc) {
    if (assoc === void 0)
      assoc = 1;
    if (this.mirror) {
      return this._map(pos, assoc, true);
    }
    for (var i = this.from; i < this.to; i++) {
      pos = this.maps[i].map(pos, assoc);
    }
    return pos;
  };
  Mapping.prototype.mapResult = function mapResult2(pos, assoc) {
    if (assoc === void 0)
      assoc = 1;
    return this._map(pos, assoc, false);
  };
  Mapping.prototype._map = function _map2(pos, assoc, simple) {
    var deleted = false;
    for (var i = this.from; i < this.to; i++) {
      var map14 = this.maps[i], result2 = map14.mapResult(pos, assoc);
      if (result2.recover != null) {
        var corr = this.getMirror(i);
        if (corr != null && corr > i && corr < this.to) {
          i = corr;
          pos = this.maps[corr].recover(result2.recover);
          continue;
        }
      }
      if (result2.deleted) {
        deleted = true;
      }
      pos = result2.pos;
    }
    return simple ? pos : new MapResult(pos, deleted);
  };
  function TransformError(message) {
    var err2 = Error.call(this, message);
    err2.__proto__ = TransformError.prototype;
    return err2;
  }
  TransformError.prototype = Object.create(Error.prototype);
  TransformError.prototype.constructor = TransformError;
  TransformError.prototype.name = "TransformError";
  var Transform = function Transform2(doc2) {
    this.doc = doc2;
    this.steps = [];
    this.docs = [];
    this.mapping = new Mapping();
  };
  var prototypeAccessors2 = {before: {configurable: true}, docChanged: {configurable: true}};
  prototypeAccessors2.before.get = function() {
    return this.docs.length ? this.docs[0] : this.doc;
  };
  Transform.prototype.step = function step(object) {
    var result2 = this.maybeStep(object);
    if (result2.failed) {
      throw new TransformError(result2.failed);
    }
    return this;
  };
  Transform.prototype.maybeStep = function maybeStep(step2) {
    var result2 = step2.apply(this.doc);
    if (!result2.failed) {
      this.addStep(step2, result2.doc);
    }
    return result2;
  };
  prototypeAccessors2.docChanged.get = function() {
    return this.steps.length > 0;
  };
  Transform.prototype.addStep = function addStep(step2, doc2) {
    this.docs.push(this.doc);
    this.steps.push(step2);
    this.mapping.appendMap(step2.getMap());
    this.doc = doc2;
  };
  Object.defineProperties(Transform.prototype, prototypeAccessors2);
  function mustOverride() {
    throw new Error("Override me");
  }
  var stepsByID = Object.create(null);
  var Step = function Step2() {
  };
  Step.prototype.apply = function apply(_doc) {
    return mustOverride();
  };
  Step.prototype.getMap = function getMap() {
    return StepMap.empty;
  };
  Step.prototype.invert = function invert3(_doc) {
    return mustOverride();
  };
  Step.prototype.map = function map3(_mapping) {
    return mustOverride();
  };
  Step.prototype.merge = function merge(_other) {
    return null;
  };
  Step.prototype.toJSON = function toJSON5() {
    return mustOverride();
  };
  Step.fromJSON = function fromJSON5(schema2, json) {
    if (!json || !json.stepType) {
      throw new RangeError("Invalid input for Step.fromJSON");
    }
    var type = stepsByID[json.stepType];
    if (!type) {
      throw new RangeError("No step type " + json.stepType + " defined");
    }
    return type.fromJSON(schema2, json);
  };
  Step.jsonID = function jsonID(id, stepClass) {
    if (id in stepsByID) {
      throw new RangeError("Duplicate use of step JSON ID " + id);
    }
    stepsByID[id] = stepClass;
    stepClass.prototype.jsonID = id;
    return stepClass;
  };
  var StepResult = function StepResult2(doc2, failed) {
    this.doc = doc2;
    this.failed = failed;
  };
  StepResult.ok = function ok(doc2) {
    return new StepResult(doc2, null);
  };
  StepResult.fail = function fail(message) {
    return new StepResult(null, message);
  };
  StepResult.fromReplace = function fromReplace(doc2, from4, to, slice4) {
    try {
      return StepResult.ok(doc2.replace(from4, to, slice4));
    } catch (e) {
      if (e instanceof ReplaceError) {
        return StepResult.fail(e.message);
      }
      throw e;
    }
  };
  var ReplaceStep = /* @__PURE__ */ function(Step3) {
    function ReplaceStep2(from4, to, slice4, structure) {
      Step3.call(this);
      this.from = from4;
      this.to = to;
      this.slice = slice4;
      this.structure = !!structure;
    }
    if (Step3)
      ReplaceStep2.__proto__ = Step3;
    ReplaceStep2.prototype = Object.create(Step3 && Step3.prototype);
    ReplaceStep2.prototype.constructor = ReplaceStep2;
    ReplaceStep2.prototype.apply = function apply8(doc2) {
      if (this.structure && contentBetween(doc2, this.from, this.to)) {
        return StepResult.fail("Structure replace would overwrite content");
      }
      return StepResult.fromReplace(doc2, this.from, this.to, this.slice);
    };
    ReplaceStep2.prototype.getMap = function getMap2() {
      return new StepMap([this.from, this.to - this.from, this.slice.size]);
    };
    ReplaceStep2.prototype.invert = function invert4(doc2) {
      return new ReplaceStep2(this.from, this.from + this.slice.size, doc2.slice(this.from, this.to));
    };
    ReplaceStep2.prototype.map = function map14(mapping) {
      var from4 = mapping.mapResult(this.from, 1), to = mapping.mapResult(this.to, -1);
      if (from4.deleted && to.deleted) {
        return null;
      }
      return new ReplaceStep2(from4.pos, Math.max(from4.pos, to.pos), this.slice);
    };
    ReplaceStep2.prototype.merge = function merge3(other) {
      if (!(other instanceof ReplaceStep2) || other.structure || this.structure) {
        return null;
      }
      if (this.from + this.slice.size == other.from && !this.slice.openEnd && !other.slice.openStart) {
        var slice4 = this.slice.size + other.slice.size == 0 ? Slice.empty : new Slice(this.slice.content.append(other.slice.content), this.slice.openStart, other.slice.openEnd);
        return new ReplaceStep2(this.from, this.to + (other.to - other.from), slice4, this.structure);
      } else if (other.to == this.from && !this.slice.openStart && !other.slice.openEnd) {
        var slice$1 = this.slice.size + other.slice.size == 0 ? Slice.empty : new Slice(other.slice.content.append(this.slice.content), other.slice.openStart, this.slice.openEnd);
        return new ReplaceStep2(other.from, this.to, slice$1, this.structure);
      } else {
        return null;
      }
    };
    ReplaceStep2.prototype.toJSON = function toJSON7() {
      var json = {stepType: "replace", from: this.from, to: this.to};
      if (this.slice.size) {
        json.slice = this.slice.toJSON();
      }
      if (this.structure) {
        json.structure = true;
      }
      return json;
    };
    ReplaceStep2.fromJSON = function fromJSON8(schema2, json) {
      if (typeof json.from != "number" || typeof json.to != "number") {
        throw new RangeError("Invalid input for ReplaceStep.fromJSON");
      }
      return new ReplaceStep2(json.from, json.to, Slice.fromJSON(schema2, json.slice), !!json.structure);
    };
    return ReplaceStep2;
  }(Step);
  Step.jsonID("replace", ReplaceStep);
  var ReplaceAroundStep = /* @__PURE__ */ function(Step3) {
    function ReplaceAroundStep2(from4, to, gapFrom, gapTo, slice4, insert, structure) {
      Step3.call(this);
      this.from = from4;
      this.to = to;
      this.gapFrom = gapFrom;
      this.gapTo = gapTo;
      this.slice = slice4;
      this.insert = insert;
      this.structure = !!structure;
    }
    if (Step3)
      ReplaceAroundStep2.__proto__ = Step3;
    ReplaceAroundStep2.prototype = Object.create(Step3 && Step3.prototype);
    ReplaceAroundStep2.prototype.constructor = ReplaceAroundStep2;
    ReplaceAroundStep2.prototype.apply = function apply8(doc2) {
      if (this.structure && (contentBetween(doc2, this.from, this.gapFrom) || contentBetween(doc2, this.gapTo, this.to))) {
        return StepResult.fail("Structure gap-replace would overwrite content");
      }
      var gap = doc2.slice(this.gapFrom, this.gapTo);
      if (gap.openStart || gap.openEnd) {
        return StepResult.fail("Gap is not a flat range");
      }
      var inserted = this.slice.insertAt(this.insert, gap.content);
      if (!inserted) {
        return StepResult.fail("Content does not fit in gap");
      }
      return StepResult.fromReplace(doc2, this.from, this.to, inserted);
    };
    ReplaceAroundStep2.prototype.getMap = function getMap2() {
      return new StepMap([
        this.from,
        this.gapFrom - this.from,
        this.insert,
        this.gapTo,
        this.to - this.gapTo,
        this.slice.size - this.insert
      ]);
    };
    ReplaceAroundStep2.prototype.invert = function invert4(doc2) {
      var gap = this.gapTo - this.gapFrom;
      return new ReplaceAroundStep2(this.from, this.from + this.slice.size + gap, this.from + this.insert, this.from + this.insert + gap, doc2.slice(this.from, this.to).removeBetween(this.gapFrom - this.from, this.gapTo - this.from), this.gapFrom - this.from, this.structure);
    };
    ReplaceAroundStep2.prototype.map = function map14(mapping) {
      var from4 = mapping.mapResult(this.from, 1), to = mapping.mapResult(this.to, -1);
      var gapFrom = mapping.map(this.gapFrom, -1), gapTo = mapping.map(this.gapTo, 1);
      if (from4.deleted && to.deleted || gapFrom < from4.pos || gapTo > to.pos) {
        return null;
      }
      return new ReplaceAroundStep2(from4.pos, to.pos, gapFrom, gapTo, this.slice, this.insert, this.structure);
    };
    ReplaceAroundStep2.prototype.toJSON = function toJSON7() {
      var json = {
        stepType: "replaceAround",
        from: this.from,
        to: this.to,
        gapFrom: this.gapFrom,
        gapTo: this.gapTo,
        insert: this.insert
      };
      if (this.slice.size) {
        json.slice = this.slice.toJSON();
      }
      if (this.structure) {
        json.structure = true;
      }
      return json;
    };
    ReplaceAroundStep2.fromJSON = function fromJSON8(schema2, json) {
      if (typeof json.from != "number" || typeof json.to != "number" || typeof json.gapFrom != "number" || typeof json.gapTo != "number" || typeof json.insert != "number") {
        throw new RangeError("Invalid input for ReplaceAroundStep.fromJSON");
      }
      return new ReplaceAroundStep2(json.from, json.to, json.gapFrom, json.gapTo, Slice.fromJSON(schema2, json.slice), json.insert, !!json.structure);
    };
    return ReplaceAroundStep2;
  }(Step);
  Step.jsonID("replaceAround", ReplaceAroundStep);
  function contentBetween(doc2, from4, to) {
    var $from = doc2.resolve(from4), dist = to - from4, depth = $from.depth;
    while (dist > 0 && depth > 0 && $from.indexAfter(depth) == $from.node(depth).childCount) {
      depth--;
      dist--;
    }
    if (dist > 0) {
      var next = $from.node(depth).maybeChild($from.indexAfter(depth));
      while (dist > 0) {
        if (!next || next.isLeaf) {
          return true;
        }
        next = next.firstChild;
        dist--;
      }
    }
    return false;
  }
  function canCut(node4, start3, end2) {
    return (start3 == 0 || node4.canReplace(start3, node4.childCount)) && (end2 == node4.childCount || node4.canReplace(0, end2));
  }
  function liftTarget(range) {
    var parent = range.parent;
    var content2 = parent.content.cutByIndex(range.startIndex, range.endIndex);
    for (var depth = range.depth; ; --depth) {
      var node4 = range.$from.node(depth);
      var index2 = range.$from.index(depth), endIndex = range.$to.indexAfter(depth);
      if (depth < range.depth && node4.canReplace(index2, endIndex, content2)) {
        return depth;
      }
      if (depth == 0 || node4.type.spec.isolating || !canCut(node4, index2, endIndex)) {
        break;
      }
    }
  }
  Transform.prototype.lift = function(range, target) {
    var $from = range.$from;
    var $to = range.$to;
    var depth = range.depth;
    var gapStart = $from.before(depth + 1), gapEnd = $to.after(depth + 1);
    var start3 = gapStart, end2 = gapEnd;
    var before2 = Fragment.empty, openStart = 0;
    for (var d = depth, splitting = false; d > target; d--) {
      if (splitting || $from.index(d) > 0) {
        splitting = true;
        before2 = Fragment.from($from.node(d).copy(before2));
        openStart++;
      } else {
        start3--;
      }
    }
    var after2 = Fragment.empty, openEnd = 0;
    for (var d$1 = depth, splitting$1 = false; d$1 > target; d$1--) {
      if (splitting$1 || $to.after(d$1 + 1) < $to.end(d$1)) {
        splitting$1 = true;
        after2 = Fragment.from($to.node(d$1).copy(after2));
        openEnd++;
      } else {
        end2++;
      }
    }
    return this.step(new ReplaceAroundStep(start3, end2, gapStart, gapEnd, new Slice(before2.append(after2), openStart, openEnd), before2.size - openStart, true));
  };
  Transform.prototype.wrap = function(range, wrappers) {
    var content2 = Fragment.empty;
    for (var i = wrappers.length - 1; i >= 0; i--) {
      content2 = Fragment.from(wrappers[i].type.create(wrappers[i].attrs, content2));
    }
    var start3 = range.start, end2 = range.end;
    return this.step(new ReplaceAroundStep(start3, end2, start3, end2, new Slice(content2, 0, 0), wrappers.length, true));
  };
  Transform.prototype.setBlockType = function(from4, to, type, attrs) {
    var this$1 = this;
    if (to === void 0)
      to = from4;
    if (!type.isTextblock) {
      throw new RangeError("Type given to setBlockType should be a textblock");
    }
    var mapFrom = this.steps.length;
    this.doc.nodesBetween(from4, to, function(node4, pos) {
      if (node4.isTextblock && !node4.hasMarkup(type, attrs) && canChangeType(this$1.doc, this$1.mapping.slice(mapFrom).map(pos), type)) {
        this$1.clearIncompatible(this$1.mapping.slice(mapFrom).map(pos, 1), type);
        var mapping = this$1.mapping.slice(mapFrom);
        var startM = mapping.map(pos, 1), endM = mapping.map(pos + node4.nodeSize, 1);
        this$1.step(new ReplaceAroundStep(startM, endM, startM + 1, endM - 1, new Slice(Fragment.from(type.create(attrs, null, node4.marks)), 0, 0), 1, true));
        return false;
      }
    });
    return this;
  };
  function canChangeType(doc2, pos, type) {
    var $pos = doc2.resolve(pos), index2 = $pos.index();
    return $pos.parent.canReplaceWith(index2, index2 + 1, type);
  }
  Transform.prototype.setNodeMarkup = function(pos, type, attrs, marks4) {
    var node4 = this.doc.nodeAt(pos);
    if (!node4) {
      throw new RangeError("No node at given position");
    }
    if (!type) {
      type = node4.type;
    }
    var newNode = type.create(attrs, null, marks4 || node4.marks);
    if (node4.isLeaf) {
      return this.replaceWith(pos, pos + node4.nodeSize, newNode);
    }
    if (!type.validContent(node4.content)) {
      throw new RangeError("Invalid content for node type " + type.name);
    }
    return this.step(new ReplaceAroundStep(pos, pos + node4.nodeSize, pos + 1, pos + node4.nodeSize - 1, new Slice(Fragment.from(newNode), 0, 0), 1, true));
  };
  function canSplit(doc2, pos, depth, typesAfter) {
    if (depth === void 0)
      depth = 1;
    var $pos = doc2.resolve(pos), base2 = $pos.depth - depth;
    var innerType = typesAfter && typesAfter[typesAfter.length - 1] || $pos.parent;
    if (base2 < 0 || $pos.parent.type.spec.isolating || !$pos.parent.canReplace($pos.index(), $pos.parent.childCount) || !innerType.type.validContent($pos.parent.content.cutByIndex($pos.index(), $pos.parent.childCount))) {
      return false;
    }
    for (var d = $pos.depth - 1, i = depth - 2; d > base2; d--, i--) {
      var node4 = $pos.node(d), index$1 = $pos.index(d);
      if (node4.type.spec.isolating) {
        return false;
      }
      var rest = node4.content.cutByIndex(index$1, node4.childCount);
      var after2 = typesAfter && typesAfter[i] || node4;
      if (after2 != node4) {
        rest = rest.replaceChild(0, after2.type.create(after2.attrs));
      }
      if (!node4.canReplace(index$1 + 1, node4.childCount) || !after2.type.validContent(rest)) {
        return false;
      }
    }
    var index2 = $pos.indexAfter(base2);
    var baseType = typesAfter && typesAfter[0];
    return $pos.node(base2).canReplaceWith(index2, index2, baseType ? baseType.type : $pos.node(base2 + 1).type);
  }
  Transform.prototype.split = function(pos, depth, typesAfter) {
    if (depth === void 0)
      depth = 1;
    var $pos = this.doc.resolve(pos), before2 = Fragment.empty, after2 = Fragment.empty;
    for (var d = $pos.depth, e = $pos.depth - depth, i = depth - 1; d > e; d--, i--) {
      before2 = Fragment.from($pos.node(d).copy(before2));
      var typeAfter = typesAfter && typesAfter[i];
      after2 = Fragment.from(typeAfter ? typeAfter.type.create(typeAfter.attrs, after2) : $pos.node(d).copy(after2));
    }
    return this.step(new ReplaceStep(pos, pos, new Slice(before2.append(after2), depth, depth), true));
  };
  function canJoin(doc2, pos) {
    var $pos = doc2.resolve(pos), index2 = $pos.index();
    return joinable2($pos.nodeBefore, $pos.nodeAfter) && $pos.parent.canReplace(index2, index2 + 1);
  }
  function joinable2(a, b) {
    return a && b && !a.isLeaf && a.canAppend(b);
  }
  Transform.prototype.join = function(pos, depth) {
    if (depth === void 0)
      depth = 1;
    var step2 = new ReplaceStep(pos - depth, pos + depth, Slice.empty, true);
    return this.step(step2);
  };
  function insertPoint(doc2, pos, nodeType2) {
    var $pos = doc2.resolve(pos);
    if ($pos.parent.canReplaceWith($pos.index(), $pos.index(), nodeType2)) {
      return pos;
    }
    if ($pos.parentOffset == 0) {
      for (var d = $pos.depth - 1; d >= 0; d--) {
        var index2 = $pos.index(d);
        if ($pos.node(d).canReplaceWith(index2, index2, nodeType2)) {
          return $pos.before(d + 1);
        }
        if (index2 > 0) {
          return null;
        }
      }
    }
    if ($pos.parentOffset == $pos.parent.content.size) {
      for (var d$1 = $pos.depth - 1; d$1 >= 0; d$1--) {
        var index$1 = $pos.indexAfter(d$1);
        if ($pos.node(d$1).canReplaceWith(index$1, index$1, nodeType2)) {
          return $pos.after(d$1 + 1);
        }
        if (index$1 < $pos.node(d$1).childCount) {
          return null;
        }
      }
    }
  }
  function dropPoint(doc2, pos, slice4) {
    var $pos = doc2.resolve(pos);
    if (!slice4.content.size) {
      return pos;
    }
    var content2 = slice4.content;
    for (var i = 0; i < slice4.openStart; i++) {
      content2 = content2.firstChild.content;
    }
    for (var pass = 1; pass <= (slice4.openStart == 0 && slice4.size ? 2 : 1); pass++) {
      for (var d = $pos.depth; d >= 0; d--) {
        var bias = d == $pos.depth ? 0 : $pos.pos <= ($pos.start(d + 1) + $pos.end(d + 1)) / 2 ? -1 : 1;
        var insertPos = $pos.index(d) + (bias > 0 ? 1 : 0);
        var parent = $pos.node(d), fits = false;
        if (pass == 1) {
          fits = parent.canReplace(insertPos, insertPos, content2);
        } else {
          var wrapping = parent.contentMatchAt(insertPos).findWrapping(content2.firstChild.type);
          fits = wrapping && parent.canReplaceWith(insertPos, insertPos, wrapping[0]);
        }
        if (fits) {
          return bias == 0 ? $pos.pos : bias < 0 ? $pos.before(d + 1) : $pos.after(d + 1);
        }
      }
    }
    return null;
  }
  function mapFragment(fragment, f, parent) {
    var mapped = [];
    for (var i = 0; i < fragment.childCount; i++) {
      var child3 = fragment.child(i);
      if (child3.content.size) {
        child3 = child3.copy(mapFragment(child3.content, f, child3));
      }
      if (child3.isInline) {
        child3 = f(child3, parent, i);
      }
      mapped.push(child3);
    }
    return Fragment.fromArray(mapped);
  }
  var AddMarkStep = /* @__PURE__ */ function(Step3) {
    function AddMarkStep2(from4, to, mark3) {
      Step3.call(this);
      this.from = from4;
      this.to = to;
      this.mark = mark3;
    }
    if (Step3)
      AddMarkStep2.__proto__ = Step3;
    AddMarkStep2.prototype = Object.create(Step3 && Step3.prototype);
    AddMarkStep2.prototype.constructor = AddMarkStep2;
    AddMarkStep2.prototype.apply = function apply8(doc2) {
      var this$1 = this;
      var oldSlice = doc2.slice(this.from, this.to), $from = doc2.resolve(this.from);
      var parent = $from.node($from.sharedDepth(this.to));
      var slice4 = new Slice(mapFragment(oldSlice.content, function(node4, parent2) {
        if (!node4.isAtom || !parent2.type.allowsMarkType(this$1.mark.type)) {
          return node4;
        }
        return node4.mark(this$1.mark.addToSet(node4.marks));
      }, parent), oldSlice.openStart, oldSlice.openEnd);
      return StepResult.fromReplace(doc2, this.from, this.to, slice4);
    };
    AddMarkStep2.prototype.invert = function invert4() {
      return new RemoveMarkStep(this.from, this.to, this.mark);
    };
    AddMarkStep2.prototype.map = function map14(mapping) {
      var from4 = mapping.mapResult(this.from, 1), to = mapping.mapResult(this.to, -1);
      if (from4.deleted && to.deleted || from4.pos >= to.pos) {
        return null;
      }
      return new AddMarkStep2(from4.pos, to.pos, this.mark);
    };
    AddMarkStep2.prototype.merge = function merge3(other) {
      if (other instanceof AddMarkStep2 && other.mark.eq(this.mark) && this.from <= other.to && this.to >= other.from) {
        return new AddMarkStep2(Math.min(this.from, other.from), Math.max(this.to, other.to), this.mark);
      }
    };
    AddMarkStep2.prototype.toJSON = function toJSON7() {
      return {
        stepType: "addMark",
        mark: this.mark.toJSON(),
        from: this.from,
        to: this.to
      };
    };
    AddMarkStep2.fromJSON = function fromJSON8(schema2, json) {
      if (typeof json.from != "number" || typeof json.to != "number") {
        throw new RangeError("Invalid input for AddMarkStep.fromJSON");
      }
      return new AddMarkStep2(json.from, json.to, schema2.markFromJSON(json.mark));
    };
    return AddMarkStep2;
  }(Step);
  Step.jsonID("addMark", AddMarkStep);
  var RemoveMarkStep = /* @__PURE__ */ function(Step3) {
    function RemoveMarkStep2(from4, to, mark3) {
      Step3.call(this);
      this.from = from4;
      this.to = to;
      this.mark = mark3;
    }
    if (Step3)
      RemoveMarkStep2.__proto__ = Step3;
    RemoveMarkStep2.prototype = Object.create(Step3 && Step3.prototype);
    RemoveMarkStep2.prototype.constructor = RemoveMarkStep2;
    RemoveMarkStep2.prototype.apply = function apply8(doc2) {
      var this$1 = this;
      var oldSlice = doc2.slice(this.from, this.to);
      var slice4 = new Slice(mapFragment(oldSlice.content, function(node4) {
        return node4.mark(this$1.mark.removeFromSet(node4.marks));
      }), oldSlice.openStart, oldSlice.openEnd);
      return StepResult.fromReplace(doc2, this.from, this.to, slice4);
    };
    RemoveMarkStep2.prototype.invert = function invert4() {
      return new AddMarkStep(this.from, this.to, this.mark);
    };
    RemoveMarkStep2.prototype.map = function map14(mapping) {
      var from4 = mapping.mapResult(this.from, 1), to = mapping.mapResult(this.to, -1);
      if (from4.deleted && to.deleted || from4.pos >= to.pos) {
        return null;
      }
      return new RemoveMarkStep2(from4.pos, to.pos, this.mark);
    };
    RemoveMarkStep2.prototype.merge = function merge3(other) {
      if (other instanceof RemoveMarkStep2 && other.mark.eq(this.mark) && this.from <= other.to && this.to >= other.from) {
        return new RemoveMarkStep2(Math.min(this.from, other.from), Math.max(this.to, other.to), this.mark);
      }
    };
    RemoveMarkStep2.prototype.toJSON = function toJSON7() {
      return {
        stepType: "removeMark",
        mark: this.mark.toJSON(),
        from: this.from,
        to: this.to
      };
    };
    RemoveMarkStep2.fromJSON = function fromJSON8(schema2, json) {
      if (typeof json.from != "number" || typeof json.to != "number") {
        throw new RangeError("Invalid input for RemoveMarkStep.fromJSON");
      }
      return new RemoveMarkStep2(json.from, json.to, schema2.markFromJSON(json.mark));
    };
    return RemoveMarkStep2;
  }(Step);
  Step.jsonID("removeMark", RemoveMarkStep);
  Transform.prototype.addMark = function(from4, to, mark3) {
    var this$1 = this;
    var removed = [], added = [], removing = null, adding = null;
    this.doc.nodesBetween(from4, to, function(node4, pos, parent) {
      if (!node4.isInline) {
        return;
      }
      var marks4 = node4.marks;
      if (!mark3.isInSet(marks4) && parent.type.allowsMarkType(mark3.type)) {
        var start3 = Math.max(pos, from4), end2 = Math.min(pos + node4.nodeSize, to);
        var newSet = mark3.addToSet(marks4);
        for (var i = 0; i < marks4.length; i++) {
          if (!marks4[i].isInSet(newSet)) {
            if (removing && removing.to == start3 && removing.mark.eq(marks4[i])) {
              removing.to = end2;
            } else {
              removed.push(removing = new RemoveMarkStep(start3, end2, marks4[i]));
            }
          }
        }
        if (adding && adding.to == start3) {
          adding.to = end2;
        } else {
          added.push(adding = new AddMarkStep(start3, end2, mark3));
        }
      }
    });
    removed.forEach(function(s) {
      return this$1.step(s);
    });
    added.forEach(function(s) {
      return this$1.step(s);
    });
    return this;
  };
  Transform.prototype.removeMark = function(from4, to, mark3) {
    var this$1 = this;
    if (mark3 === void 0)
      mark3 = null;
    var matched = [], step2 = 0;
    this.doc.nodesBetween(from4, to, function(node4, pos) {
      if (!node4.isInline) {
        return;
      }
      step2++;
      var toRemove = null;
      if (mark3 instanceof MarkType) {
        var set2 = node4.marks, found2;
        while (found2 = mark3.isInSet(set2)) {
          (toRemove || (toRemove = [])).push(found2);
          set2 = found2.removeFromSet(set2);
        }
      } else if (mark3) {
        if (mark3.isInSet(node4.marks)) {
          toRemove = [mark3];
        }
      } else {
        toRemove = node4.marks;
      }
      if (toRemove && toRemove.length) {
        var end2 = Math.min(pos + node4.nodeSize, to);
        for (var i = 0; i < toRemove.length; i++) {
          var style = toRemove[i], found$1 = void 0;
          for (var j = 0; j < matched.length; j++) {
            var m = matched[j];
            if (m.step == step2 - 1 && style.eq(matched[j].style)) {
              found$1 = m;
            }
          }
          if (found$1) {
            found$1.to = end2;
            found$1.step = step2;
          } else {
            matched.push({style, from: Math.max(pos, from4), to: end2, step: step2});
          }
        }
      }
    });
    matched.forEach(function(m) {
      return this$1.step(new RemoveMarkStep(m.from, m.to, m.style));
    });
    return this;
  };
  Transform.prototype.clearIncompatible = function(pos, parentType, match) {
    if (match === void 0)
      match = parentType.contentMatch;
    var node4 = this.doc.nodeAt(pos);
    var delSteps = [], cur = pos + 1;
    for (var i = 0; i < node4.childCount; i++) {
      var child3 = node4.child(i), end2 = cur + child3.nodeSize;
      var allowed = match.matchType(child3.type, child3.attrs);
      if (!allowed) {
        delSteps.push(new ReplaceStep(cur, end2, Slice.empty));
      } else {
        match = allowed;
        for (var j = 0; j < child3.marks.length; j++) {
          if (!parentType.allowsMarkType(child3.marks[j].type)) {
            this.step(new RemoveMarkStep(cur, end2, child3.marks[j]));
          }
        }
      }
      cur = end2;
    }
    if (!match.validEnd) {
      var fill = match.fillBefore(Fragment.empty, true);
      this.replace(cur, cur, new Slice(fill, 0, 0));
    }
    for (var i$1 = delSteps.length - 1; i$1 >= 0; i$1--) {
      this.step(delSteps[i$1]);
    }
    return this;
  };
  function replaceStep(doc2, from4, to, slice4) {
    if (to === void 0)
      to = from4;
    if (slice4 === void 0)
      slice4 = Slice.empty;
    if (from4 == to && !slice4.size) {
      return null;
    }
    var $from = doc2.resolve(from4), $to = doc2.resolve(to);
    if (fitsTrivially($from, $to, slice4)) {
      return new ReplaceStep(from4, to, slice4);
    }
    return new Fitter($from, $to, slice4).fit();
  }
  Transform.prototype.replace = function(from4, to, slice4) {
    if (to === void 0)
      to = from4;
    if (slice4 === void 0)
      slice4 = Slice.empty;
    var step2 = replaceStep(this.doc, from4, to, slice4);
    if (step2) {
      this.step(step2);
    }
    return this;
  };
  Transform.prototype.replaceWith = function(from4, to, content2) {
    return this.replace(from4, to, new Slice(Fragment.from(content2), 0, 0));
  };
  Transform.prototype.delete = function(from4, to) {
    return this.replace(from4, to, Slice.empty);
  };
  Transform.prototype.insert = function(pos, content2) {
    return this.replaceWith(pos, pos, content2);
  };
  function fitsTrivially($from, $to, slice4) {
    return !slice4.openStart && !slice4.openEnd && $from.start() == $to.start() && $from.parent.canReplace($from.index(), $to.index(), slice4.content);
  }
  var Fitter = function Fitter2($from, $to, slice4) {
    this.$to = $to;
    this.$from = $from;
    this.unplaced = slice4;
    this.frontier = [];
    for (var i = 0; i <= $from.depth; i++) {
      var node4 = $from.node(i);
      this.frontier.push({
        type: node4.type,
        match: node4.contentMatchAt($from.indexAfter(i))
      });
    }
    this.placed = Fragment.empty;
    for (var i$1 = $from.depth; i$1 > 0; i$1--) {
      this.placed = Fragment.from($from.node(i$1).copy(this.placed));
    }
  };
  var prototypeAccessors$12 = {depth: {configurable: true}};
  prototypeAccessors$12.depth.get = function() {
    return this.frontier.length - 1;
  };
  Fitter.prototype.fit = function fit() {
    while (this.unplaced.size) {
      var fit2 = this.findFittable();
      if (fit2) {
        this.placeNodes(fit2);
      } else {
        this.openMore() || this.dropNode();
      }
    }
    var moveInline = this.mustMoveInline(), placedSize = this.placed.size - this.depth - this.$from.depth;
    var $from = this.$from, $to = this.close(moveInline < 0 ? this.$to : $from.doc.resolve(moveInline));
    if (!$to) {
      return null;
    }
    var content2 = this.placed, openStart = $from.depth, openEnd = $to.depth;
    while (openStart && openEnd && content2.childCount == 1) {
      content2 = content2.firstChild.content;
      openStart--;
      openEnd--;
    }
    var slice4 = new Slice(content2, openStart, openEnd);
    if (moveInline > -1) {
      return new ReplaceAroundStep($from.pos, moveInline, this.$to.pos, this.$to.end(), slice4, placedSize);
    }
    if (slice4.size || $from.pos != this.$to.pos) {
      return new ReplaceStep($from.pos, $to.pos, slice4);
    }
  };
  Fitter.prototype.findFittable = function findFittable() {
    for (var pass = 1; pass <= 2; pass++) {
      for (var sliceDepth = this.unplaced.openStart; sliceDepth >= 0; sliceDepth--) {
        var fragment = void 0, parent = void 0;
        if (sliceDepth) {
          parent = contentAt(this.unplaced.content, sliceDepth - 1).firstChild;
          fragment = parent.content;
        } else {
          fragment = this.unplaced.content;
        }
        var first = fragment.firstChild;
        for (var frontierDepth = this.depth; frontierDepth >= 0; frontierDepth--) {
          var ref = this.frontier[frontierDepth];
          var type = ref.type;
          var match = ref.match;
          var wrap = void 0, inject = void 0;
          if (pass == 1 && (first ? match.matchType(first.type) || (inject = match.fillBefore(Fragment.from(first), false)) : type.compatibleContent(parent.type))) {
            return {sliceDepth, frontierDepth, parent, inject};
          } else if (pass == 2 && first && (wrap = match.findWrapping(first.type))) {
            return {sliceDepth, frontierDepth, parent, wrap};
          }
          if (parent && match.matchType(parent.type)) {
            break;
          }
        }
      }
    }
  };
  Fitter.prototype.openMore = function openMore() {
    var ref = this.unplaced;
    var content2 = ref.content;
    var openStart = ref.openStart;
    var openEnd = ref.openEnd;
    var inner = contentAt(content2, openStart);
    if (!inner.childCount || inner.firstChild.isLeaf) {
      return false;
    }
    this.unplaced = new Slice(content2, openStart + 1, Math.max(openEnd, inner.size + openStart >= content2.size - openEnd ? openStart + 1 : 0));
    return true;
  };
  Fitter.prototype.dropNode = function dropNode() {
    var ref = this.unplaced;
    var content2 = ref.content;
    var openStart = ref.openStart;
    var openEnd = ref.openEnd;
    var inner = contentAt(content2, openStart);
    if (inner.childCount <= 1 && openStart > 0) {
      var openAtEnd = content2.size - openStart <= openStart + inner.size;
      this.unplaced = new Slice(dropFromFragment(content2, openStart - 1, 1), openStart - 1, openAtEnd ? openStart - 1 : openEnd);
    } else {
      this.unplaced = new Slice(dropFromFragment(content2, openStart, 1), openStart, openEnd);
    }
  };
  Fitter.prototype.placeNodes = function placeNodes(ref) {
    var sliceDepth = ref.sliceDepth;
    var frontierDepth = ref.frontierDepth;
    var parent = ref.parent;
    var inject = ref.inject;
    var wrap = ref.wrap;
    while (this.depth > frontierDepth) {
      this.closeFrontierNode();
    }
    if (wrap) {
      for (var i = 0; i < wrap.length; i++) {
        this.openFrontierNode(wrap[i]);
      }
    }
    var slice4 = this.unplaced, fragment = parent ? parent.content : slice4.content;
    var openStart = slice4.openStart - sliceDepth;
    var taken = 0, add2 = [];
    var ref$1 = this.frontier[frontierDepth];
    var match = ref$1.match;
    var type = ref$1.type;
    if (inject) {
      for (var i$1 = 0; i$1 < inject.childCount; i$1++) {
        add2.push(inject.child(i$1));
      }
      match = match.matchFragment(inject);
    }
    var openEndCount = fragment.size + sliceDepth - (slice4.content.size - slice4.openEnd);
    while (taken < fragment.childCount) {
      var next = fragment.child(taken), matches2 = match.matchType(next.type);
      if (!matches2) {
        break;
      }
      taken++;
      if (taken > 1 || openStart == 0 || next.content.size) {
        match = matches2;
        add2.push(closeNodeStart(next.mark(type.allowedMarks(next.marks)), taken == 1 ? openStart : 0, taken == fragment.childCount ? openEndCount : -1));
      }
    }
    var toEnd = taken == fragment.childCount;
    if (!toEnd) {
      openEndCount = -1;
    }
    this.placed = addToFragment(this.placed, frontierDepth, Fragment.from(add2));
    this.frontier[frontierDepth].match = match;
    if (toEnd && openEndCount < 0 && parent && parent.type == this.frontier[this.depth].type && this.frontier.length > 1) {
      this.closeFrontierNode();
    }
    for (var i$2 = 0, cur = fragment; i$2 < openEndCount; i$2++) {
      var node4 = cur.lastChild;
      this.frontier.push({type: node4.type, match: node4.contentMatchAt(node4.childCount)});
      cur = node4.content;
    }
    this.unplaced = !toEnd ? new Slice(dropFromFragment(slice4.content, sliceDepth, taken), slice4.openStart, slice4.openEnd) : sliceDepth == 0 ? Slice.empty : new Slice(dropFromFragment(slice4.content, sliceDepth - 1, 1), sliceDepth - 1, openEndCount < 0 ? slice4.openEnd : sliceDepth - 1);
  };
  Fitter.prototype.mustMoveInline = function mustMoveInline() {
    if (!this.$to.parent.isTextblock || this.$to.end() == this.$to.pos) {
      return -1;
    }
    var top = this.frontier[this.depth], level;
    if (!top.type.isTextblock || !contentAfterFits(this.$to, this.$to.depth, top.type, top.match, false) || this.$to.depth == this.depth && (level = this.findCloseLevel(this.$to)) && level.depth == this.depth) {
      return -1;
    }
    var ref = this.$to;
    var depth = ref.depth;
    var after2 = this.$to.after(depth);
    while (depth > 1 && after2 == this.$to.end(--depth)) {
      ++after2;
    }
    return after2;
  };
  Fitter.prototype.findCloseLevel = function findCloseLevel($to) {
    scan:
      for (var i = Math.min(this.depth, $to.depth); i >= 0; i--) {
        var ref = this.frontier[i];
        var match = ref.match;
        var type = ref.type;
        var dropInner = i < $to.depth && $to.end(i + 1) == $to.pos + ($to.depth - (i + 1));
        var fit2 = contentAfterFits($to, i, type, match, dropInner);
        if (!fit2) {
          continue;
        }
        for (var d = i - 1; d >= 0; d--) {
          var ref$1 = this.frontier[d];
          var match$1 = ref$1.match;
          var type$1 = ref$1.type;
          var matches2 = contentAfterFits($to, d, type$1, match$1, true);
          if (!matches2 || matches2.childCount) {
            continue scan;
          }
        }
        return {depth: i, fit: fit2, move: dropInner ? $to.doc.resolve($to.after(i + 1)) : $to};
      }
  };
  Fitter.prototype.close = function close2($to) {
    var close3 = this.findCloseLevel($to);
    if (!close3) {
      return null;
    }
    while (this.depth > close3.depth) {
      this.closeFrontierNode();
    }
    if (close3.fit.childCount) {
      this.placed = addToFragment(this.placed, close3.depth, close3.fit);
    }
    $to = close3.move;
    for (var d = close3.depth + 1; d <= $to.depth; d++) {
      var node4 = $to.node(d), add2 = node4.type.contentMatch.fillBefore(node4.content, true, $to.index(d));
      this.openFrontierNode(node4.type, node4.attrs, add2);
    }
    return $to;
  };
  Fitter.prototype.openFrontierNode = function openFrontierNode(type, attrs, content2) {
    var top = this.frontier[this.depth];
    top.match = top.match.matchType(type);
    this.placed = addToFragment(this.placed, this.depth, Fragment.from(type.create(attrs, content2)));
    this.frontier.push({type, match: type.contentMatch});
  };
  Fitter.prototype.closeFrontierNode = function closeFrontierNode() {
    var open = this.frontier.pop();
    var add2 = open.match.fillBefore(Fragment.empty, true);
    if (add2.childCount) {
      this.placed = addToFragment(this.placed, this.frontier.length, add2);
    }
  };
  Object.defineProperties(Fitter.prototype, prototypeAccessors$12);
  function dropFromFragment(fragment, depth, count) {
    if (depth == 0) {
      return fragment.cutByIndex(count);
    }
    return fragment.replaceChild(0, fragment.firstChild.copy(dropFromFragment(fragment.firstChild.content, depth - 1, count)));
  }
  function addToFragment(fragment, depth, content2) {
    if (depth == 0) {
      return fragment.append(content2);
    }
    return fragment.replaceChild(fragment.childCount - 1, fragment.lastChild.copy(addToFragment(fragment.lastChild.content, depth - 1, content2)));
  }
  function contentAt(fragment, depth) {
    for (var i = 0; i < depth; i++) {
      fragment = fragment.firstChild.content;
    }
    return fragment;
  }
  function closeNodeStart(node4, openStart, openEnd) {
    if (openStart <= 0) {
      return node4;
    }
    var frag = node4.content;
    if (openStart > 1) {
      frag = frag.replaceChild(0, closeNodeStart(frag.firstChild, openStart - 1, frag.childCount == 1 ? openEnd - 1 : 0));
    }
    if (openStart > 0) {
      frag = node4.type.contentMatch.fillBefore(frag).append(frag);
      if (openEnd <= 0) {
        frag = frag.append(node4.type.contentMatch.matchFragment(frag).fillBefore(Fragment.empty, true));
      }
    }
    return node4.copy(frag);
  }
  function contentAfterFits($to, depth, type, match, open) {
    var node4 = $to.node(depth), index2 = open ? $to.indexAfter(depth) : $to.index(depth);
    if (index2 == node4.childCount && !type.compatibleContent(node4.type)) {
      return null;
    }
    var fit2 = match.fillBefore(node4.content, true, index2);
    return fit2 && !invalidMarks(type, node4.content, index2) ? fit2 : null;
  }
  function invalidMarks(type, fragment, start3) {
    for (var i = start3; i < fragment.childCount; i++) {
      if (!type.allowsMarks(fragment.child(i).marks)) {
        return true;
      }
    }
    return false;
  }
  Transform.prototype.replaceRange = function(from4, to, slice4) {
    if (!slice4.size) {
      return this.deleteRange(from4, to);
    }
    var $from = this.doc.resolve(from4), $to = this.doc.resolve(to);
    if (fitsTrivially($from, $to, slice4)) {
      return this.step(new ReplaceStep(from4, to, slice4));
    }
    var targetDepths = coveredDepths($from, this.doc.resolve(to));
    if (targetDepths[targetDepths.length - 1] == 0) {
      targetDepths.pop();
    }
    var preferredTarget = -($from.depth + 1);
    targetDepths.unshift(preferredTarget);
    for (var d = $from.depth, pos = $from.pos - 1; d > 0; d--, pos--) {
      var spec = $from.node(d).type.spec;
      if (spec.defining || spec.isolating) {
        break;
      }
      if (targetDepths.indexOf(d) > -1) {
        preferredTarget = d;
      } else if ($from.before(d) == pos) {
        targetDepths.splice(1, 0, -d);
      }
    }
    var preferredTargetIndex = targetDepths.indexOf(preferredTarget);
    var leftNodes = [], preferredDepth = slice4.openStart;
    for (var content2 = slice4.content, i = 0; ; i++) {
      var node4 = content2.firstChild;
      leftNodes.push(node4);
      if (i == slice4.openStart) {
        break;
      }
      content2 = node4.content;
    }
    if (preferredDepth > 0 && leftNodes[preferredDepth - 1].type.spec.defining && $from.node(preferredTargetIndex).type != leftNodes[preferredDepth - 1].type) {
      preferredDepth -= 1;
    } else if (preferredDepth >= 2 && leftNodes[preferredDepth - 1].isTextblock && leftNodes[preferredDepth - 2].type.spec.defining && $from.node(preferredTargetIndex).type != leftNodes[preferredDepth - 2].type) {
      preferredDepth -= 2;
    }
    for (var j = slice4.openStart; j >= 0; j--) {
      var openDepth = (j + preferredDepth + 1) % (slice4.openStart + 1);
      var insert = leftNodes[openDepth];
      if (!insert) {
        continue;
      }
      for (var i$1 = 0; i$1 < targetDepths.length; i$1++) {
        var targetDepth = targetDepths[(i$1 + preferredTargetIndex) % targetDepths.length], expand = true;
        if (targetDepth < 0) {
          expand = false;
          targetDepth = -targetDepth;
        }
        var parent = $from.node(targetDepth - 1), index2 = $from.index(targetDepth - 1);
        if (parent.canReplaceWith(index2, index2, insert.type, insert.marks)) {
          return this.replace($from.before(targetDepth), expand ? $to.after(targetDepth) : to, new Slice(closeFragment(slice4.content, 0, slice4.openStart, openDepth), openDepth, slice4.openEnd));
        }
      }
    }
    var startSteps = this.steps.length;
    for (var i$2 = targetDepths.length - 1; i$2 >= 0; i$2--) {
      this.replace(from4, to, slice4);
      if (this.steps.length > startSteps) {
        break;
      }
      var depth = targetDepths[i$2];
      if (depth < 0) {
        continue;
      }
      from4 = $from.before(depth);
      to = $to.after(depth);
    }
    return this;
  };
  function closeFragment(fragment, depth, oldOpen, newOpen, parent) {
    if (depth < oldOpen) {
      var first = fragment.firstChild;
      fragment = fragment.replaceChild(0, first.copy(closeFragment(first.content, depth + 1, oldOpen, newOpen, first)));
    }
    if (depth > newOpen) {
      var match = parent.contentMatchAt(0);
      var start3 = match.fillBefore(fragment).append(fragment);
      fragment = start3.append(match.matchFragment(start3).fillBefore(Fragment.empty, true));
    }
    return fragment;
  }
  Transform.prototype.replaceRangeWith = function(from4, to, node4) {
    if (!node4.isInline && from4 == to && this.doc.resolve(from4).parent.content.size) {
      var point = insertPoint(this.doc, from4, node4.type);
      if (point != null) {
        from4 = to = point;
      }
    }
    return this.replaceRange(from4, to, new Slice(Fragment.from(node4), 0, 0));
  };
  Transform.prototype.deleteRange = function(from4, to) {
    var $from = this.doc.resolve(from4), $to = this.doc.resolve(to);
    var covered = coveredDepths($from, $to);
    for (var i = 0; i < covered.length; i++) {
      var depth = covered[i], last = i == covered.length - 1;
      if (last && depth == 0 || $from.node(depth).type.contentMatch.validEnd) {
        return this.delete($from.start(depth), $to.end(depth));
      }
      if (depth > 0 && (last || $from.node(depth - 1).canReplace($from.index(depth - 1), $to.indexAfter(depth - 1)))) {
        return this.delete($from.before(depth), $to.after(depth));
      }
    }
    for (var d = 1; d <= $from.depth && d <= $to.depth; d++) {
      if (from4 - $from.start(d) == $from.depth - d && to > $from.end(d) && $to.end(d) - to != $to.depth - d) {
        return this.delete($from.before(d), to);
      }
    }
    return this.delete(from4, to);
  };
  function coveredDepths($from, $to) {
    var result2 = [], minDepth = Math.min($from.depth, $to.depth);
    for (var d = minDepth; d >= 0; d--) {
      var start3 = $from.start(d);
      if (start3 < $from.pos - ($from.depth - d) || $to.end(d) > $to.pos + ($to.depth - d) || $from.node(d).type.spec.isolating || $to.node(d).type.spec.isolating) {
        break;
      }
      if (start3 == $to.start(d) || d == $from.depth && d == $to.depth && $from.parent.inlineContent && $to.parent.inlineContent && d && $to.start(d - 1) == start3 - 1) {
        result2.push(d);
      }
    }
    return result2;
  }

  // node_modules/prosemirror-state/dist/index.es.js
  var classesById = Object.create(null);
  var Selection = function Selection2($anchor, $head, ranges) {
    this.ranges = ranges || [new SelectionRange($anchor.min($head), $anchor.max($head))];
    this.$anchor = $anchor;
    this.$head = $head;
  };
  var prototypeAccessors3 = {anchor: {configurable: true}, head: {configurable: true}, from: {configurable: true}, to: {configurable: true}, $from: {configurable: true}, $to: {configurable: true}, empty: {configurable: true}};
  prototypeAccessors3.anchor.get = function() {
    return this.$anchor.pos;
  };
  prototypeAccessors3.head.get = function() {
    return this.$head.pos;
  };
  prototypeAccessors3.from.get = function() {
    return this.$from.pos;
  };
  prototypeAccessors3.to.get = function() {
    return this.$to.pos;
  };
  prototypeAccessors3.$from.get = function() {
    return this.ranges[0].$from;
  };
  prototypeAccessors3.$to.get = function() {
    return this.ranges[0].$to;
  };
  prototypeAccessors3.empty.get = function() {
    var ranges = this.ranges;
    for (var i = 0; i < ranges.length; i++) {
      if (ranges[i].$from.pos != ranges[i].$to.pos) {
        return false;
      }
    }
    return true;
  };
  Selection.prototype.content = function content() {
    return this.$from.node(0).slice(this.from, this.to, true);
  };
  Selection.prototype.replace = function replace2(tr, content2) {
    if (content2 === void 0)
      content2 = Slice.empty;
    var lastNode = content2.content.lastChild, lastParent = null;
    for (var i = 0; i < content2.openEnd; i++) {
      lastParent = lastNode;
      lastNode = lastNode.lastChild;
    }
    var mapFrom = tr.steps.length, ranges = this.ranges;
    for (var i$1 = 0; i$1 < ranges.length; i$1++) {
      var ref = ranges[i$1];
      var $from = ref.$from;
      var $to = ref.$to;
      var mapping = tr.mapping.slice(mapFrom);
      tr.replaceRange(mapping.map($from.pos), mapping.map($to.pos), i$1 ? Slice.empty : content2);
      if (i$1 == 0) {
        selectionToInsertionEnd(tr, mapFrom, (lastNode ? lastNode.isInline : lastParent && lastParent.isTextblock) ? -1 : 1);
      }
    }
  };
  Selection.prototype.replaceWith = function replaceWith(tr, node4) {
    var mapFrom = tr.steps.length, ranges = this.ranges;
    for (var i = 0; i < ranges.length; i++) {
      var ref = ranges[i];
      var $from = ref.$from;
      var $to = ref.$to;
      var mapping = tr.mapping.slice(mapFrom);
      var from4 = mapping.map($from.pos), to = mapping.map($to.pos);
      if (i) {
        tr.deleteRange(from4, to);
      } else {
        tr.replaceRangeWith(from4, to, node4);
        selectionToInsertionEnd(tr, mapFrom, node4.isInline ? -1 : 1);
      }
    }
  };
  Selection.findFrom = function findFrom($pos, dir, textOnly) {
    var inner = $pos.parent.inlineContent ? new TextSelection($pos) : findSelectionIn($pos.node(0), $pos.parent, $pos.pos, $pos.index(), dir, textOnly);
    if (inner) {
      return inner;
    }
    for (var depth = $pos.depth - 1; depth >= 0; depth--) {
      var found2 = dir < 0 ? findSelectionIn($pos.node(0), $pos.node(depth), $pos.before(depth + 1), $pos.index(depth), dir, textOnly) : findSelectionIn($pos.node(0), $pos.node(depth), $pos.after(depth + 1), $pos.index(depth) + 1, dir, textOnly);
      if (found2) {
        return found2;
      }
    }
  };
  Selection.near = function near($pos, bias) {
    if (bias === void 0)
      bias = 1;
    return this.findFrom($pos, bias) || this.findFrom($pos, -bias) || new AllSelection($pos.node(0));
  };
  Selection.atStart = function atStart(doc2) {
    return findSelectionIn(doc2, doc2, 0, 0, 1) || new AllSelection(doc2);
  };
  Selection.atEnd = function atEnd(doc2) {
    return findSelectionIn(doc2, doc2, doc2.content.size, doc2.childCount, -1) || new AllSelection(doc2);
  };
  Selection.fromJSON = function fromJSON6(doc2, json) {
    if (!json || !json.type) {
      throw new RangeError("Invalid input for Selection.fromJSON");
    }
    var cls = classesById[json.type];
    if (!cls) {
      throw new RangeError("No selection type " + json.type + " defined");
    }
    return cls.fromJSON(doc2, json);
  };
  Selection.jsonID = function jsonID2(id, selectionClass) {
    if (id in classesById) {
      throw new RangeError("Duplicate use of selection JSON ID " + id);
    }
    classesById[id] = selectionClass;
    selectionClass.prototype.jsonID = id;
    return selectionClass;
  };
  Selection.prototype.getBookmark = function getBookmark() {
    return TextSelection.between(this.$anchor, this.$head).getBookmark();
  };
  Object.defineProperties(Selection.prototype, prototypeAccessors3);
  Selection.prototype.visible = true;
  var SelectionRange = function SelectionRange2($from, $to) {
    this.$from = $from;
    this.$to = $to;
  };
  var TextSelection = /* @__PURE__ */ function(Selection3) {
    function TextSelection2($anchor, $head) {
      if ($head === void 0)
        $head = $anchor;
      Selection3.call(this, $anchor, $head);
    }
    if (Selection3)
      TextSelection2.__proto__ = Selection3;
    TextSelection2.prototype = Object.create(Selection3 && Selection3.prototype);
    TextSelection2.prototype.constructor = TextSelection2;
    var prototypeAccessors$15 = {$cursor: {configurable: true}};
    prototypeAccessors$15.$cursor.get = function() {
      return this.$anchor.pos == this.$head.pos ? this.$head : null;
    };
    TextSelection2.prototype.map = function map14(doc2, mapping) {
      var $head = doc2.resolve(mapping.map(this.head));
      if (!$head.parent.inlineContent) {
        return Selection3.near($head);
      }
      var $anchor = doc2.resolve(mapping.map(this.anchor));
      return new TextSelection2($anchor.parent.inlineContent ? $anchor : $head, $head);
    };
    TextSelection2.prototype.replace = function replace3(tr, content2) {
      if (content2 === void 0)
        content2 = Slice.empty;
      Selection3.prototype.replace.call(this, tr, content2);
      if (content2 == Slice.empty) {
        var marks4 = this.$from.marksAcross(this.$to);
        if (marks4) {
          tr.ensureMarks(marks4);
        }
      }
    };
    TextSelection2.prototype.eq = function eq12(other) {
      return other instanceof TextSelection2 && other.anchor == this.anchor && other.head == this.head;
    };
    TextSelection2.prototype.getBookmark = function getBookmark2() {
      return new TextBookmark(this.anchor, this.head);
    };
    TextSelection2.prototype.toJSON = function toJSON7() {
      return {type: "text", anchor: this.anchor, head: this.head};
    };
    TextSelection2.fromJSON = function fromJSON8(doc2, json) {
      if (typeof json.anchor != "number" || typeof json.head != "number") {
        throw new RangeError("Invalid input for TextSelection.fromJSON");
      }
      return new TextSelection2(doc2.resolve(json.anchor), doc2.resolve(json.head));
    };
    TextSelection2.create = function create5(doc2, anchor, head) {
      if (head === void 0)
        head = anchor;
      var $anchor = doc2.resolve(anchor);
      return new this($anchor, head == anchor ? $anchor : doc2.resolve(head));
    };
    TextSelection2.between = function between($anchor, $head, bias) {
      var dPos = $anchor.pos - $head.pos;
      if (!bias || dPos) {
        bias = dPos >= 0 ? 1 : -1;
      }
      if (!$head.parent.inlineContent) {
        var found2 = Selection3.findFrom($head, bias, true) || Selection3.findFrom($head, -bias, true);
        if (found2) {
          $head = found2.$head;
        } else {
          return Selection3.near($head, bias);
        }
      }
      if (!$anchor.parent.inlineContent) {
        if (dPos == 0) {
          $anchor = $head;
        } else {
          $anchor = (Selection3.findFrom($anchor, -bias, true) || Selection3.findFrom($anchor, bias, true)).$anchor;
          if ($anchor.pos < $head.pos != dPos < 0) {
            $anchor = $head;
          }
        }
      }
      return new TextSelection2($anchor, $head);
    };
    Object.defineProperties(TextSelection2.prototype, prototypeAccessors$15);
    return TextSelection2;
  }(Selection);
  Selection.jsonID("text", TextSelection);
  var TextBookmark = function TextBookmark2(anchor, head) {
    this.anchor = anchor;
    this.head = head;
  };
  TextBookmark.prototype.map = function map4(mapping) {
    return new TextBookmark(mapping.map(this.anchor), mapping.map(this.head));
  };
  TextBookmark.prototype.resolve = function resolve3(doc2) {
    return TextSelection.between(doc2.resolve(this.anchor), doc2.resolve(this.head));
  };
  var NodeSelection = /* @__PURE__ */ function(Selection3) {
    function NodeSelection2($pos) {
      var node4 = $pos.nodeAfter;
      var $end = $pos.node(0).resolve($pos.pos + node4.nodeSize);
      Selection3.call(this, $pos, $end);
      this.node = node4;
    }
    if (Selection3)
      NodeSelection2.__proto__ = Selection3;
    NodeSelection2.prototype = Object.create(Selection3 && Selection3.prototype);
    NodeSelection2.prototype.constructor = NodeSelection2;
    NodeSelection2.prototype.map = function map14(doc2, mapping) {
      var ref = mapping.mapResult(this.anchor);
      var deleted = ref.deleted;
      var pos = ref.pos;
      var $pos = doc2.resolve(pos);
      if (deleted) {
        return Selection3.near($pos);
      }
      return new NodeSelection2($pos);
    };
    NodeSelection2.prototype.content = function content2() {
      return new Slice(Fragment.from(this.node), 0, 0);
    };
    NodeSelection2.prototype.eq = function eq12(other) {
      return other instanceof NodeSelection2 && other.anchor == this.anchor;
    };
    NodeSelection2.prototype.toJSON = function toJSON7() {
      return {type: "node", anchor: this.anchor};
    };
    NodeSelection2.prototype.getBookmark = function getBookmark2() {
      return new NodeBookmark(this.anchor);
    };
    NodeSelection2.fromJSON = function fromJSON8(doc2, json) {
      if (typeof json.anchor != "number") {
        throw new RangeError("Invalid input for NodeSelection.fromJSON");
      }
      return new NodeSelection2(doc2.resolve(json.anchor));
    };
    NodeSelection2.create = function create5(doc2, from4) {
      return new this(doc2.resolve(from4));
    };
    NodeSelection2.isSelectable = function isSelectable(node4) {
      return !node4.isText && node4.type.spec.selectable !== false;
    };
    return NodeSelection2;
  }(Selection);
  NodeSelection.prototype.visible = false;
  Selection.jsonID("node", NodeSelection);
  var NodeBookmark = function NodeBookmark2(anchor) {
    this.anchor = anchor;
  };
  NodeBookmark.prototype.map = function map5(mapping) {
    var ref = mapping.mapResult(this.anchor);
    var deleted = ref.deleted;
    var pos = ref.pos;
    return deleted ? new TextBookmark(pos, pos) : new NodeBookmark(pos);
  };
  NodeBookmark.prototype.resolve = function resolve4(doc2) {
    var $pos = doc2.resolve(this.anchor), node4 = $pos.nodeAfter;
    if (node4 && NodeSelection.isSelectable(node4)) {
      return new NodeSelection($pos);
    }
    return Selection.near($pos);
  };
  var AllSelection = /* @__PURE__ */ function(Selection3) {
    function AllSelection2(doc2) {
      Selection3.call(this, doc2.resolve(0), doc2.resolve(doc2.content.size));
    }
    if (Selection3)
      AllSelection2.__proto__ = Selection3;
    AllSelection2.prototype = Object.create(Selection3 && Selection3.prototype);
    AllSelection2.prototype.constructor = AllSelection2;
    AllSelection2.prototype.replace = function replace3(tr, content2) {
      if (content2 === void 0)
        content2 = Slice.empty;
      if (content2 == Slice.empty) {
        tr.delete(0, tr.doc.content.size);
        var sel = Selection3.atStart(tr.doc);
        if (!sel.eq(tr.selection)) {
          tr.setSelection(sel);
        }
      } else {
        Selection3.prototype.replace.call(this, tr, content2);
      }
    };
    AllSelection2.prototype.toJSON = function toJSON7() {
      return {type: "all"};
    };
    AllSelection2.fromJSON = function fromJSON8(doc2) {
      return new AllSelection2(doc2);
    };
    AllSelection2.prototype.map = function map14(doc2) {
      return new AllSelection2(doc2);
    };
    AllSelection2.prototype.eq = function eq12(other) {
      return other instanceof AllSelection2;
    };
    AllSelection2.prototype.getBookmark = function getBookmark2() {
      return AllBookmark;
    };
    return AllSelection2;
  }(Selection);
  Selection.jsonID("all", AllSelection);
  var AllBookmark = {
    map: function map6() {
      return this;
    },
    resolve: function resolve5(doc2) {
      return new AllSelection(doc2);
    }
  };
  function findSelectionIn(doc2, node4, pos, index2, dir, text2) {
    if (node4.inlineContent) {
      return TextSelection.create(doc2, pos);
    }
    for (var i = index2 - (dir > 0 ? 0 : 1); dir > 0 ? i < node4.childCount : i >= 0; i += dir) {
      var child3 = node4.child(i);
      if (!child3.isAtom) {
        var inner = findSelectionIn(doc2, child3, pos + dir, dir < 0 ? child3.childCount : 0, dir, text2);
        if (inner) {
          return inner;
        }
      } else if (!text2 && NodeSelection.isSelectable(child3)) {
        return NodeSelection.create(doc2, pos - (dir < 0 ? child3.nodeSize : 0));
      }
      pos += child3.nodeSize * dir;
    }
  }
  function selectionToInsertionEnd(tr, startLen, bias) {
    var last = tr.steps.length - 1;
    if (last < startLen) {
      return;
    }
    var step2 = tr.steps[last];
    if (!(step2 instanceof ReplaceStep || step2 instanceof ReplaceAroundStep)) {
      return;
    }
    var map14 = tr.mapping.maps[last], end2;
    map14.forEach(function(_from, _to, _newFrom, newTo) {
      if (end2 == null) {
        end2 = newTo;
      }
    });
    tr.setSelection(Selection.near(tr.doc.resolve(end2), bias));
  }
  var UPDATED_SEL = 1;
  var UPDATED_MARKS = 2;
  var UPDATED_SCROLL = 4;
  var Transaction = /* @__PURE__ */ function(Transform3) {
    function Transaction2(state2) {
      Transform3.call(this, state2.doc);
      this.time = Date.now();
      this.curSelection = state2.selection;
      this.curSelectionFor = 0;
      this.storedMarks = state2.storedMarks;
      this.updated = 0;
      this.meta = Object.create(null);
    }
    if (Transform3)
      Transaction2.__proto__ = Transform3;
    Transaction2.prototype = Object.create(Transform3 && Transform3.prototype);
    Transaction2.prototype.constructor = Transaction2;
    var prototypeAccessors5 = {selection: {configurable: true}, selectionSet: {configurable: true}, storedMarksSet: {configurable: true}, isGeneric: {configurable: true}, scrolledIntoView: {configurable: true}};
    prototypeAccessors5.selection.get = function() {
      if (this.curSelectionFor < this.steps.length) {
        this.curSelection = this.curSelection.map(this.doc, this.mapping.slice(this.curSelectionFor));
        this.curSelectionFor = this.steps.length;
      }
      return this.curSelection;
    };
    Transaction2.prototype.setSelection = function setSelection2(selection) {
      if (selection.$from.doc != this.doc) {
        throw new RangeError("Selection passed to setSelection must point at the current document");
      }
      this.curSelection = selection;
      this.curSelectionFor = this.steps.length;
      this.updated = (this.updated | UPDATED_SEL) & ~UPDATED_MARKS;
      this.storedMarks = null;
      return this;
    };
    prototypeAccessors5.selectionSet.get = function() {
      return (this.updated & UPDATED_SEL) > 0;
    };
    Transaction2.prototype.setStoredMarks = function setStoredMarks(marks4) {
      this.storedMarks = marks4;
      this.updated |= UPDATED_MARKS;
      return this;
    };
    Transaction2.prototype.ensureMarks = function ensureMarks(marks4) {
      if (!Mark.sameSet(this.storedMarks || this.selection.$from.marks(), marks4)) {
        this.setStoredMarks(marks4);
      }
      return this;
    };
    Transaction2.prototype.addStoredMark = function addStoredMark(mark3) {
      return this.ensureMarks(mark3.addToSet(this.storedMarks || this.selection.$head.marks()));
    };
    Transaction2.prototype.removeStoredMark = function removeStoredMark(mark3) {
      return this.ensureMarks(mark3.removeFromSet(this.storedMarks || this.selection.$head.marks()));
    };
    prototypeAccessors5.storedMarksSet.get = function() {
      return (this.updated & UPDATED_MARKS) > 0;
    };
    Transaction2.prototype.addStep = function addStep2(step2, doc2) {
      Transform3.prototype.addStep.call(this, step2, doc2);
      this.updated = this.updated & ~UPDATED_MARKS;
      this.storedMarks = null;
    };
    Transaction2.prototype.setTime = function setTime(time) {
      this.time = time;
      return this;
    };
    Transaction2.prototype.replaceSelection = function replaceSelection(slice4) {
      this.selection.replace(this, slice4);
      return this;
    };
    Transaction2.prototype.replaceSelectionWith = function replaceSelectionWith(node4, inheritMarks) {
      var selection = this.selection;
      if (inheritMarks !== false) {
        node4 = node4.mark(this.storedMarks || (selection.empty ? selection.$from.marks() : selection.$from.marksAcross(selection.$to) || Mark.none));
      }
      selection.replaceWith(this, node4);
      return this;
    };
    Transaction2.prototype.deleteSelection = function deleteSelection2() {
      this.selection.replace(this);
      return this;
    };
    Transaction2.prototype.insertText = function insertText(text2, from4, to) {
      if (to === void 0)
        to = from4;
      var schema2 = this.doc.type.schema;
      if (from4 == null) {
        if (!text2) {
          return this.deleteSelection();
        }
        return this.replaceSelectionWith(schema2.text(text2), true);
      } else {
        if (!text2) {
          return this.deleteRange(from4, to);
        }
        var marks4 = this.storedMarks;
        if (!marks4) {
          var $from = this.doc.resolve(from4);
          marks4 = to == from4 ? $from.marks() : $from.marksAcross(this.doc.resolve(to));
        }
        this.replaceRangeWith(from4, to, schema2.text(text2, marks4));
        if (!this.selection.empty) {
          this.setSelection(Selection.near(this.selection.$to));
        }
        return this;
      }
    };
    Transaction2.prototype.setMeta = function setMeta(key, value) {
      this.meta[typeof key == "string" ? key : key.key] = value;
      return this;
    };
    Transaction2.prototype.getMeta = function getMeta(key) {
      return this.meta[typeof key == "string" ? key : key.key];
    };
    prototypeAccessors5.isGeneric.get = function() {
      for (var _ in this.meta) {
        return false;
      }
      return true;
    };
    Transaction2.prototype.scrollIntoView = function scrollIntoView() {
      this.updated |= UPDATED_SCROLL;
      return this;
    };
    prototypeAccessors5.scrolledIntoView.get = function() {
      return (this.updated & UPDATED_SCROLL) > 0;
    };
    Object.defineProperties(Transaction2.prototype, prototypeAccessors5);
    return Transaction2;
  }(Transform);
  function bind(f, self) {
    return !self || !f ? f : f.bind(self);
  }
  var FieldDesc = function FieldDesc2(name, desc, self) {
    this.name = name;
    this.init = bind(desc.init, self);
    this.apply = bind(desc.apply, self);
  };
  var baseFields = [
    new FieldDesc("doc", {
      init: function init(config) {
        return config.doc || config.schema.topNodeType.createAndFill();
      },
      apply: function apply2(tr) {
        return tr.doc;
      }
    }),
    new FieldDesc("selection", {
      init: function init2(config, instance) {
        return config.selection || Selection.atStart(instance.doc);
      },
      apply: function apply3(tr) {
        return tr.selection;
      }
    }),
    new FieldDesc("storedMarks", {
      init: function init3(config) {
        return config.storedMarks || null;
      },
      apply: function apply4(tr, _marks, _old, state2) {
        return state2.selection.$cursor ? tr.storedMarks : null;
      }
    }),
    new FieldDesc("scrollToSelection", {
      init: function init4() {
        return 0;
      },
      apply: function apply5(tr, prev) {
        return tr.scrolledIntoView ? prev + 1 : prev;
      }
    })
  ];
  var Configuration = function Configuration2(schema2, plugins) {
    var this$1 = this;
    this.schema = schema2;
    this.fields = baseFields.concat();
    this.plugins = [];
    this.pluginsByKey = Object.create(null);
    if (plugins) {
      plugins.forEach(function(plugin) {
        if (this$1.pluginsByKey[plugin.key]) {
          throw new RangeError("Adding different instances of a keyed plugin (" + plugin.key + ")");
        }
        this$1.plugins.push(plugin);
        this$1.pluginsByKey[plugin.key] = plugin;
        if (plugin.spec.state) {
          this$1.fields.push(new FieldDesc(plugin.key, plugin.spec.state, plugin));
        }
      });
    }
  };
  var EditorState = function EditorState2(config) {
    this.config = config;
  };
  var prototypeAccessors$13 = {schema: {configurable: true}, plugins: {configurable: true}, tr: {configurable: true}};
  prototypeAccessors$13.schema.get = function() {
    return this.config.schema;
  };
  prototypeAccessors$13.plugins.get = function() {
    return this.config.plugins;
  };
  EditorState.prototype.apply = function apply6(tr) {
    return this.applyTransaction(tr).state;
  };
  EditorState.prototype.filterTransaction = function filterTransaction(tr, ignore) {
    if (ignore === void 0)
      ignore = -1;
    for (var i = 0; i < this.config.plugins.length; i++) {
      if (i != ignore) {
        var plugin = this.config.plugins[i];
        if (plugin.spec.filterTransaction && !plugin.spec.filterTransaction.call(plugin, tr, this)) {
          return false;
        }
      }
    }
    return true;
  };
  EditorState.prototype.applyTransaction = function applyTransaction(rootTr) {
    if (!this.filterTransaction(rootTr)) {
      return {state: this, transactions: []};
    }
    var trs = [rootTr], newState = this.applyInner(rootTr), seen = null;
    for (; ; ) {
      var haveNew = false;
      for (var i = 0; i < this.config.plugins.length; i++) {
        var plugin = this.config.plugins[i];
        if (plugin.spec.appendTransaction) {
          var n = seen ? seen[i].n : 0, oldState = seen ? seen[i].state : this;
          var tr = n < trs.length && plugin.spec.appendTransaction.call(plugin, n ? trs.slice(n) : trs, oldState, newState);
          if (tr && newState.filterTransaction(tr, i)) {
            tr.setMeta("appendedTransaction", rootTr);
            if (!seen) {
              seen = [];
              for (var j = 0; j < this.config.plugins.length; j++) {
                seen.push(j < i ? {state: newState, n: trs.length} : {state: this, n: 0});
              }
            }
            trs.push(tr);
            newState = newState.applyInner(tr);
            haveNew = true;
          }
          if (seen) {
            seen[i] = {state: newState, n: trs.length};
          }
        }
      }
      if (!haveNew) {
        return {state: newState, transactions: trs};
      }
    }
  };
  EditorState.prototype.applyInner = function applyInner(tr) {
    if (!tr.before.eq(this.doc)) {
      throw new RangeError("Applying a mismatched transaction");
    }
    var newInstance = new EditorState(this.config), fields = this.config.fields;
    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      newInstance[field.name] = field.apply(tr, this[field.name], this, newInstance);
    }
    for (var i$1 = 0; i$1 < applyListeners.length; i$1++) {
      applyListeners[i$1](this, tr, newInstance);
    }
    return newInstance;
  };
  prototypeAccessors$13.tr.get = function() {
    return new Transaction(this);
  };
  EditorState.create = function create3(config) {
    var $config = new Configuration(config.doc ? config.doc.type.schema : config.schema, config.plugins);
    var instance = new EditorState($config);
    for (var i = 0; i < $config.fields.length; i++) {
      instance[$config.fields[i].name] = $config.fields[i].init(config, instance);
    }
    return instance;
  };
  EditorState.prototype.reconfigure = function reconfigure(config) {
    var $config = new Configuration(this.schema, config.plugins);
    var fields = $config.fields, instance = new EditorState($config);
    for (var i = 0; i < fields.length; i++) {
      var name = fields[i].name;
      instance[name] = this.hasOwnProperty(name) ? this[name] : fields[i].init(config, instance);
    }
    return instance;
  };
  EditorState.prototype.toJSON = function toJSON6(pluginFields) {
    var result2 = {doc: this.doc.toJSON(), selection: this.selection.toJSON()};
    if (this.storedMarks) {
      result2.storedMarks = this.storedMarks.map(function(m) {
        return m.toJSON();
      });
    }
    if (pluginFields && typeof pluginFields == "object") {
      for (var prop in pluginFields) {
        if (prop == "doc" || prop == "selection") {
          throw new RangeError("The JSON fields `doc` and `selection` are reserved");
        }
        var plugin = pluginFields[prop], state2 = plugin.spec.state;
        if (state2 && state2.toJSON) {
          result2[prop] = state2.toJSON.call(plugin, this[plugin.key]);
        }
      }
    }
    return result2;
  };
  EditorState.fromJSON = function fromJSON7(config, json, pluginFields) {
    if (!json) {
      throw new RangeError("Invalid input for EditorState.fromJSON");
    }
    if (!config.schema) {
      throw new RangeError("Required config field 'schema' missing");
    }
    var $config = new Configuration(config.schema, config.plugins);
    var instance = new EditorState($config);
    $config.fields.forEach(function(field) {
      if (field.name == "doc") {
        instance.doc = Node.fromJSON(config.schema, json.doc);
      } else if (field.name == "selection") {
        instance.selection = Selection.fromJSON(instance.doc, json.selection);
      } else if (field.name == "storedMarks") {
        if (json.storedMarks) {
          instance.storedMarks = json.storedMarks.map(config.schema.markFromJSON);
        }
      } else {
        if (pluginFields) {
          for (var prop in pluginFields) {
            var plugin = pluginFields[prop], state2 = plugin.spec.state;
            if (plugin.key == field.name && state2 && state2.fromJSON && Object.prototype.hasOwnProperty.call(json, prop)) {
              instance[field.name] = state2.fromJSON.call(plugin, config, json[prop], instance);
              return;
            }
          }
        }
        instance[field.name] = field.init(config, instance);
      }
    });
    return instance;
  };
  EditorState.addApplyListener = function addApplyListener(f) {
    applyListeners.push(f);
  };
  EditorState.removeApplyListener = function removeApplyListener(f) {
    var found2 = applyListeners.indexOf(f);
    if (found2 > -1) {
      applyListeners.splice(found2, 1);
    }
  };
  Object.defineProperties(EditorState.prototype, prototypeAccessors$13);
  var applyListeners = [];
  function bindProps(obj, self, target) {
    for (var prop in obj) {
      var val = obj[prop];
      if (val instanceof Function) {
        val = val.bind(self);
      } else if (prop == "handleDOMEvents") {
        val = bindProps(val, self, {});
      }
      target[prop] = val;
    }
    return target;
  }
  var Plugin = function Plugin2(spec) {
    this.props = {};
    if (spec.props) {
      bindProps(spec.props, this, this.props);
    }
    this.spec = spec;
    this.key = spec.key ? spec.key.key : createKey("plugin");
  };
  Plugin.prototype.getState = function getState(state2) {
    return state2[this.key];
  };
  var keys = Object.create(null);
  function createKey(name) {
    if (name in keys) {
      return name + "$" + ++keys[name];
    }
    keys[name] = 0;
    return name + "$";
  }
  var PluginKey = function PluginKey2(name) {
    if (name === void 0)
      name = "key";
    this.key = createKey(name);
  };
  PluginKey.prototype.get = function get(state2) {
    return state2.config.pluginsByKey[this.key];
  };
  PluginKey.prototype.getState = function getState2(state2) {
    return state2[this.key];
  };

  // node_modules/prosemirror-commands/dist/index.es.js
  function deleteSelection(state2, dispatch2) {
    if (state2.selection.empty) {
      return false;
    }
    if (dispatch2) {
      dispatch2(state2.tr.deleteSelection().scrollIntoView());
    }
    return true;
  }
  function joinBackward(state2, dispatch2, view2) {
    var ref = state2.selection;
    var $cursor = ref.$cursor;
    if (!$cursor || (view2 ? !view2.endOfTextblock("backward", state2) : $cursor.parentOffset > 0)) {
      return false;
    }
    var $cut = findCutBefore($cursor);
    if (!$cut) {
      var range = $cursor.blockRange(), target = range && liftTarget(range);
      if (target == null) {
        return false;
      }
      if (dispatch2) {
        dispatch2(state2.tr.lift(range, target).scrollIntoView());
      }
      return true;
    }
    var before2 = $cut.nodeBefore;
    if (!before2.type.spec.isolating && deleteBarrier(state2, $cut, dispatch2)) {
      return true;
    }
    if ($cursor.parent.content.size == 0 && (textblockAt(before2, "end") || NodeSelection.isSelectable(before2))) {
      if (dispatch2) {
        var tr = state2.tr.deleteRange($cursor.before(), $cursor.after());
        tr.setSelection(textblockAt(before2, "end") ? Selection.findFrom(tr.doc.resolve(tr.mapping.map($cut.pos, -1)), -1) : NodeSelection.create(tr.doc, $cut.pos - before2.nodeSize));
        dispatch2(tr.scrollIntoView());
      }
      return true;
    }
    if (before2.isAtom && $cut.depth == $cursor.depth - 1) {
      if (dispatch2) {
        dispatch2(state2.tr.delete($cut.pos - before2.nodeSize, $cut.pos).scrollIntoView());
      }
      return true;
    }
    return false;
  }
  function textblockAt(node4, side, only) {
    for (; node4; node4 = side == "start" ? node4.firstChild : node4.lastChild) {
      if (node4.isTextblock) {
        return true;
      }
      if (only && node4.childCount != 1) {
        return false;
      }
    }
    return false;
  }
  function selectNodeBackward(state2, dispatch2, view2) {
    var ref = state2.selection;
    var $head = ref.$head;
    var empty2 = ref.empty;
    var $cut = $head;
    if (!empty2) {
      return false;
    }
    if ($head.parent.isTextblock) {
      if (view2 ? !view2.endOfTextblock("backward", state2) : $head.parentOffset > 0) {
        return false;
      }
      $cut = findCutBefore($head);
    }
    var node4 = $cut && $cut.nodeBefore;
    if (!node4 || !NodeSelection.isSelectable(node4)) {
      return false;
    }
    if (dispatch2) {
      dispatch2(state2.tr.setSelection(NodeSelection.create(state2.doc, $cut.pos - node4.nodeSize)).scrollIntoView());
    }
    return true;
  }
  function findCutBefore($pos) {
    if (!$pos.parent.type.spec.isolating) {
      for (var i = $pos.depth - 1; i >= 0; i--) {
        if ($pos.index(i) > 0) {
          return $pos.doc.resolve($pos.before(i + 1));
        }
        if ($pos.node(i).type.spec.isolating) {
          break;
        }
      }
    }
    return null;
  }
  function joinForward(state2, dispatch2, view2) {
    var ref = state2.selection;
    var $cursor = ref.$cursor;
    if (!$cursor || (view2 ? !view2.endOfTextblock("forward", state2) : $cursor.parentOffset < $cursor.parent.content.size)) {
      return false;
    }
    var $cut = findCutAfter($cursor);
    if (!$cut) {
      return false;
    }
    var after2 = $cut.nodeAfter;
    if (deleteBarrier(state2, $cut, dispatch2)) {
      return true;
    }
    if ($cursor.parent.content.size == 0 && (textblockAt(after2, "start") || NodeSelection.isSelectable(after2))) {
      if (dispatch2) {
        var tr = state2.tr.deleteRange($cursor.before(), $cursor.after());
        tr.setSelection(textblockAt(after2, "start") ? Selection.findFrom(tr.doc.resolve(tr.mapping.map($cut.pos)), 1) : NodeSelection.create(tr.doc, tr.mapping.map($cut.pos)));
        dispatch2(tr.scrollIntoView());
      }
      return true;
    }
    if (after2.isAtom && $cut.depth == $cursor.depth - 1) {
      if (dispatch2) {
        dispatch2(state2.tr.delete($cut.pos, $cut.pos + after2.nodeSize).scrollIntoView());
      }
      return true;
    }
    return false;
  }
  function selectNodeForward(state2, dispatch2, view2) {
    var ref = state2.selection;
    var $head = ref.$head;
    var empty2 = ref.empty;
    var $cut = $head;
    if (!empty2) {
      return false;
    }
    if ($head.parent.isTextblock) {
      if (view2 ? !view2.endOfTextblock("forward", state2) : $head.parentOffset < $head.parent.content.size) {
        return false;
      }
      $cut = findCutAfter($head);
    }
    var node4 = $cut && $cut.nodeAfter;
    if (!node4 || !NodeSelection.isSelectable(node4)) {
      return false;
    }
    if (dispatch2) {
      dispatch2(state2.tr.setSelection(NodeSelection.create(state2.doc, $cut.pos)).scrollIntoView());
    }
    return true;
  }
  function findCutAfter($pos) {
    if (!$pos.parent.type.spec.isolating) {
      for (var i = $pos.depth - 1; i >= 0; i--) {
        var parent = $pos.node(i);
        if ($pos.index(i) + 1 < parent.childCount) {
          return $pos.doc.resolve($pos.after(i + 1));
        }
        if (parent.type.spec.isolating) {
          break;
        }
      }
    }
    return null;
  }
  function newlineInCode(state2, dispatch2) {
    var ref = state2.selection;
    var $head = ref.$head;
    var $anchor = ref.$anchor;
    if (!$head.parent.type.spec.code || !$head.sameParent($anchor)) {
      return false;
    }
    if (dispatch2) {
      dispatch2(state2.tr.insertText("\n").scrollIntoView());
    }
    return true;
  }
  function defaultBlockAt(match) {
    for (var i = 0; i < match.edgeCount; i++) {
      var ref = match.edge(i);
      var type = ref.type;
      if (type.isTextblock && !type.hasRequiredAttrs()) {
        return type;
      }
    }
    return null;
  }
  function exitCode(state2, dispatch2) {
    var ref = state2.selection;
    var $head = ref.$head;
    var $anchor = ref.$anchor;
    if (!$head.parent.type.spec.code || !$head.sameParent($anchor)) {
      return false;
    }
    var above = $head.node(-1), after2 = $head.indexAfter(-1), type = defaultBlockAt(above.contentMatchAt(after2));
    if (!above.canReplaceWith(after2, after2, type)) {
      return false;
    }
    if (dispatch2) {
      var pos = $head.after(), tr = state2.tr.replaceWith(pos, pos, type.createAndFill());
      tr.setSelection(Selection.near(tr.doc.resolve(pos), 1));
      dispatch2(tr.scrollIntoView());
    }
    return true;
  }
  function createParagraphNear(state2, dispatch2) {
    var sel = state2.selection;
    var $from = sel.$from;
    var $to = sel.$to;
    if (sel instanceof AllSelection || $from.parent.inlineContent || $to.parent.inlineContent) {
      return false;
    }
    var type = defaultBlockAt($to.parent.contentMatchAt($to.indexAfter()));
    if (!type || !type.isTextblock) {
      return false;
    }
    if (dispatch2) {
      var side = (!$from.parentOffset && $to.index() < $to.parent.childCount ? $from : $to).pos;
      var tr = state2.tr.insert(side, type.createAndFill());
      tr.setSelection(TextSelection.create(tr.doc, side + 1));
      dispatch2(tr.scrollIntoView());
    }
    return true;
  }
  function liftEmptyBlock(state2, dispatch2) {
    var ref = state2.selection;
    var $cursor = ref.$cursor;
    if (!$cursor || $cursor.parent.content.size) {
      return false;
    }
    if ($cursor.depth > 1 && $cursor.after() != $cursor.end(-1)) {
      var before2 = $cursor.before();
      if (canSplit(state2.doc, before2)) {
        if (dispatch2) {
          dispatch2(state2.tr.split(before2).scrollIntoView());
        }
        return true;
      }
    }
    var range = $cursor.blockRange(), target = range && liftTarget(range);
    if (target == null) {
      return false;
    }
    if (dispatch2) {
      dispatch2(state2.tr.lift(range, target).scrollIntoView());
    }
    return true;
  }
  function splitBlock(state2, dispatch2) {
    var ref = state2.selection;
    var $from = ref.$from;
    var $to = ref.$to;
    if (state2.selection instanceof NodeSelection && state2.selection.node.isBlock) {
      if (!$from.parentOffset || !canSplit(state2.doc, $from.pos)) {
        return false;
      }
      if (dispatch2) {
        dispatch2(state2.tr.split($from.pos).scrollIntoView());
      }
      return true;
    }
    if (!$from.parent.isBlock) {
      return false;
    }
    if (dispatch2) {
      var atEnd2 = $to.parentOffset == $to.parent.content.size;
      var tr = state2.tr;
      if (state2.selection instanceof TextSelection || state2.selection instanceof AllSelection) {
        tr.deleteSelection();
      }
      var deflt = $from.depth == 0 ? null : defaultBlockAt($from.node(-1).contentMatchAt($from.indexAfter(-1)));
      var types = atEnd2 && deflt ? [{type: deflt}] : null;
      var can = canSplit(tr.doc, tr.mapping.map($from.pos), 1, types);
      if (!types && !can && canSplit(tr.doc, tr.mapping.map($from.pos), 1, deflt && [{type: deflt}])) {
        types = [{type: deflt}];
        can = true;
      }
      if (can) {
        tr.split(tr.mapping.map($from.pos), 1, types);
        if (!atEnd2 && !$from.parentOffset && $from.parent.type != deflt) {
          var first = tr.mapping.map($from.before()), $first = tr.doc.resolve(first);
          if ($from.node(-1).canReplaceWith($first.index(), $first.index() + 1, deflt)) {
            tr.setNodeMarkup(tr.mapping.map($from.before()), deflt);
          }
        }
      }
      dispatch2(tr.scrollIntoView());
    }
    return true;
  }
  function selectAll(state2, dispatch2) {
    if (dispatch2) {
      dispatch2(state2.tr.setSelection(new AllSelection(state2.doc)));
    }
    return true;
  }
  function joinMaybeClear(state2, $pos, dispatch2) {
    var before2 = $pos.nodeBefore, after2 = $pos.nodeAfter, index2 = $pos.index();
    if (!before2 || !after2 || !before2.type.compatibleContent(after2.type)) {
      return false;
    }
    if (!before2.content.size && $pos.parent.canReplace(index2 - 1, index2)) {
      if (dispatch2) {
        dispatch2(state2.tr.delete($pos.pos - before2.nodeSize, $pos.pos).scrollIntoView());
      }
      return true;
    }
    if (!$pos.parent.canReplace(index2, index2 + 1) || !(after2.isTextblock || canJoin(state2.doc, $pos.pos))) {
      return false;
    }
    if (dispatch2) {
      dispatch2(state2.tr.clearIncompatible($pos.pos, before2.type, before2.contentMatchAt(before2.childCount)).join($pos.pos).scrollIntoView());
    }
    return true;
  }
  function deleteBarrier(state2, $cut, dispatch2) {
    var before2 = $cut.nodeBefore, after2 = $cut.nodeAfter, conn, match;
    if (before2.type.spec.isolating || after2.type.spec.isolating) {
      return false;
    }
    if (joinMaybeClear(state2, $cut, dispatch2)) {
      return true;
    }
    var canDelAfter = $cut.parent.canReplace($cut.index(), $cut.index() + 1);
    if (canDelAfter && (conn = (match = before2.contentMatchAt(before2.childCount)).findWrapping(after2.type)) && match.matchType(conn[0] || after2.type).validEnd) {
      if (dispatch2) {
        var end2 = $cut.pos + after2.nodeSize, wrap = Fragment.empty;
        for (var i = conn.length - 1; i >= 0; i--) {
          wrap = Fragment.from(conn[i].create(null, wrap));
        }
        wrap = Fragment.from(before2.copy(wrap));
        var tr = state2.tr.step(new ReplaceAroundStep($cut.pos - 1, end2, $cut.pos, end2, new Slice(wrap, 1, 0), conn.length, true));
        var joinAt = end2 + 2 * conn.length;
        if (canJoin(tr.doc, joinAt)) {
          tr.join(joinAt);
        }
        dispatch2(tr.scrollIntoView());
      }
      return true;
    }
    var selAfter = Selection.findFrom($cut, 1);
    var range = selAfter && selAfter.$from.blockRange(selAfter.$to), target = range && liftTarget(range);
    if (target != null && target >= $cut.depth) {
      if (dispatch2) {
        dispatch2(state2.tr.lift(range, target).scrollIntoView());
      }
      return true;
    }
    if (canDelAfter && textblockAt(after2, "start", true) && textblockAt(before2, "end")) {
      var at = before2, wrap$1 = [];
      for (; ; ) {
        wrap$1.push(at);
        if (at.isTextblock) {
          break;
        }
        at = at.lastChild;
      }
      var afterText = after2, afterDepth = 1;
      for (; !afterText.isTextblock; afterText = afterText.firstChild) {
        afterDepth++;
      }
      if (at.canReplace(at.childCount, at.childCount, afterText.content)) {
        if (dispatch2) {
          var end$1 = Fragment.empty;
          for (var i$1 = wrap$1.length - 1; i$1 >= 0; i$1--) {
            end$1 = Fragment.from(wrap$1[i$1].copy(end$1));
          }
          var tr$1 = state2.tr.step(new ReplaceAroundStep($cut.pos - wrap$1.length, $cut.pos + after2.nodeSize, $cut.pos + afterDepth, $cut.pos + after2.nodeSize - afterDepth, new Slice(end$1, wrap$1.length, 0), 0, true));
          dispatch2(tr$1.scrollIntoView());
        }
        return true;
      }
    }
    return false;
  }
  function chainCommands() {
    var commands = [], len = arguments.length;
    while (len--)
      commands[len] = arguments[len];
    return function(state2, dispatch2, view2) {
      for (var i = 0; i < commands.length; i++) {
        if (commands[i](state2, dispatch2, view2)) {
          return true;
        }
      }
      return false;
    };
  }
  var backspace = chainCommands(deleteSelection, joinBackward, selectNodeBackward);
  var del = chainCommands(deleteSelection, joinForward, selectNodeForward);
  var pcBaseKeymap = {
    "Enter": chainCommands(newlineInCode, createParagraphNear, liftEmptyBlock, splitBlock),
    "Mod-Enter": exitCode,
    "Backspace": backspace,
    "Mod-Backspace": backspace,
    "Shift-Backspace": backspace,
    "Delete": del,
    "Mod-Delete": del,
    "Mod-a": selectAll
  };
  var macBaseKeymap = {
    "Ctrl-h": pcBaseKeymap["Backspace"],
    "Alt-Backspace": pcBaseKeymap["Mod-Backspace"],
    "Ctrl-d": pcBaseKeymap["Delete"],
    "Ctrl-Alt-Backspace": pcBaseKeymap["Mod-Delete"],
    "Alt-Delete": pcBaseKeymap["Mod-Delete"],
    "Alt-d": pcBaseKeymap["Mod-Delete"]
  };
  for (var key in pcBaseKeymap) {
    macBaseKeymap[key] = pcBaseKeymap[key];
  }
  var mac = typeof navigator != "undefined" ? /Mac|iP(hone|[oa]d)/.test(navigator.platform) : typeof os != "undefined" ? os.platform() == "darwin" : false;
  var baseKeymap = mac ? macBaseKeymap : pcBaseKeymap;

  // node_modules/rope-sequence/dist/index.es.js
  var GOOD_LEAF_SIZE = 200;
  var RopeSequence = function RopeSequence2() {
  };
  RopeSequence.prototype.append = function append2(other) {
    if (!other.length) {
      return this;
    }
    other = RopeSequence.from(other);
    return !this.length && other || other.length < GOOD_LEAF_SIZE && this.leafAppend(other) || this.length < GOOD_LEAF_SIZE && other.leafPrepend(this) || this.appendInner(other);
  };
  RopeSequence.prototype.prepend = function prepend(other) {
    if (!other.length) {
      return this;
    }
    return RopeSequence.from(other).append(this);
  };
  RopeSequence.prototype.appendInner = function appendInner(other) {
    return new Append(this, other);
  };
  RopeSequence.prototype.slice = function slice3(from4, to) {
    if (from4 === void 0)
      from4 = 0;
    if (to === void 0)
      to = this.length;
    if (from4 >= to) {
      return RopeSequence.empty;
    }
    return this.sliceInner(Math.max(0, from4), Math.min(this.length, to));
  };
  RopeSequence.prototype.get = function get2(i) {
    if (i < 0 || i >= this.length) {
      return void 0;
    }
    return this.getInner(i);
  };
  RopeSequence.prototype.forEach = function forEach4(f, from4, to) {
    if (from4 === void 0)
      from4 = 0;
    if (to === void 0)
      to = this.length;
    if (from4 <= to) {
      this.forEachInner(f, from4, to, 0);
    } else {
      this.forEachInvertedInner(f, from4, to, 0);
    }
  };
  RopeSequence.prototype.map = function map7(f, from4, to) {
    if (from4 === void 0)
      from4 = 0;
    if (to === void 0)
      to = this.length;
    var result2 = [];
    this.forEach(function(elt, i) {
      return result2.push(f(elt, i));
    }, from4, to);
    return result2;
  };
  RopeSequence.from = function from2(values) {
    if (values instanceof RopeSequence) {
      return values;
    }
    return values && values.length ? new Leaf(values) : RopeSequence.empty;
  };
  var Leaf = /* @__PURE__ */ function(RopeSequence3) {
    function Leaf2(values) {
      RopeSequence3.call(this);
      this.values = values;
    }
    if (RopeSequence3)
      Leaf2.__proto__ = RopeSequence3;
    Leaf2.prototype = Object.create(RopeSequence3 && RopeSequence3.prototype);
    Leaf2.prototype.constructor = Leaf2;
    var prototypeAccessors5 = {length: {configurable: true}, depth: {configurable: true}};
    Leaf2.prototype.flatten = function flatten() {
      return this.values;
    };
    Leaf2.prototype.sliceInner = function sliceInner(from4, to) {
      if (from4 == 0 && to == this.length) {
        return this;
      }
      return new Leaf2(this.values.slice(from4, to));
    };
    Leaf2.prototype.getInner = function getInner(i) {
      return this.values[i];
    };
    Leaf2.prototype.forEachInner = function forEachInner(f, from4, to, start3) {
      for (var i = from4; i < to; i++) {
        if (f(this.values[i], start3 + i) === false) {
          return false;
        }
      }
    };
    Leaf2.prototype.forEachInvertedInner = function forEachInvertedInner(f, from4, to, start3) {
      for (var i = from4 - 1; i >= to; i--) {
        if (f(this.values[i], start3 + i) === false) {
          return false;
        }
      }
    };
    Leaf2.prototype.leafAppend = function leafAppend(other) {
      if (this.length + other.length <= GOOD_LEAF_SIZE) {
        return new Leaf2(this.values.concat(other.flatten()));
      }
    };
    Leaf2.prototype.leafPrepend = function leafPrepend(other) {
      if (this.length + other.length <= GOOD_LEAF_SIZE) {
        return new Leaf2(other.flatten().concat(this.values));
      }
    };
    prototypeAccessors5.length.get = function() {
      return this.values.length;
    };
    prototypeAccessors5.depth.get = function() {
      return 0;
    };
    Object.defineProperties(Leaf2.prototype, prototypeAccessors5);
    return Leaf2;
  }(RopeSequence);
  RopeSequence.empty = new Leaf([]);
  var Append = /* @__PURE__ */ function(RopeSequence3) {
    function Append2(left, right) {
      RopeSequence3.call(this);
      this.left = left;
      this.right = right;
      this.length = left.length + right.length;
      this.depth = Math.max(left.depth, right.depth) + 1;
    }
    if (RopeSequence3)
      Append2.__proto__ = RopeSequence3;
    Append2.prototype = Object.create(RopeSequence3 && RopeSequence3.prototype);
    Append2.prototype.constructor = Append2;
    Append2.prototype.flatten = function flatten() {
      return this.left.flatten().concat(this.right.flatten());
    };
    Append2.prototype.getInner = function getInner(i) {
      return i < this.left.length ? this.left.get(i) : this.right.get(i - this.left.length);
    };
    Append2.prototype.forEachInner = function forEachInner(f, from4, to, start3) {
      var leftLen = this.left.length;
      if (from4 < leftLen && this.left.forEachInner(f, from4, Math.min(to, leftLen), start3) === false) {
        return false;
      }
      if (to > leftLen && this.right.forEachInner(f, Math.max(from4 - leftLen, 0), Math.min(this.length, to) - leftLen, start3 + leftLen) === false) {
        return false;
      }
    };
    Append2.prototype.forEachInvertedInner = function forEachInvertedInner(f, from4, to, start3) {
      var leftLen = this.left.length;
      if (from4 > leftLen && this.right.forEachInvertedInner(f, from4 - leftLen, Math.max(to, leftLen) - leftLen, start3 + leftLen) === false) {
        return false;
      }
      if (to < leftLen && this.left.forEachInvertedInner(f, Math.min(from4, leftLen), to, start3) === false) {
        return false;
      }
    };
    Append2.prototype.sliceInner = function sliceInner(from4, to) {
      if (from4 == 0 && to == this.length) {
        return this;
      }
      var leftLen = this.left.length;
      if (to <= leftLen) {
        return this.left.slice(from4, to);
      }
      if (from4 >= leftLen) {
        return this.right.slice(from4 - leftLen, to - leftLen);
      }
      return this.left.slice(from4, leftLen).append(this.right.slice(0, to - leftLen));
    };
    Append2.prototype.leafAppend = function leafAppend(other) {
      var inner = this.right.leafAppend(other);
      if (inner) {
        return new Append2(this.left, inner);
      }
    };
    Append2.prototype.leafPrepend = function leafPrepend(other) {
      var inner = this.left.leafPrepend(other);
      if (inner) {
        return new Append2(inner, this.right);
      }
    };
    Append2.prototype.appendInner = function appendInner2(other) {
      if (this.left.depth >= Math.max(this.right.depth, other.depth) + 1) {
        return new Append2(this.left, new Append2(this.right, other));
      }
      return new Append2(this, other);
    };
    return Append2;
  }(RopeSequence);
  var ropeSequence = RopeSequence;
  var index_es_default2 = ropeSequence;

  // node_modules/prosemirror-history/dist/index.es.js
  var max_empty_items = 500;
  var Branch = function Branch2(items, eventCount) {
    this.items = items;
    this.eventCount = eventCount;
  };
  Branch.prototype.popEvent = function popEvent(state2, preserveItems) {
    var this$1 = this;
    if (this.eventCount == 0) {
      return null;
    }
    var end2 = this.items.length;
    for (; ; end2--) {
      var next = this.items.get(end2 - 1);
      if (next.selection) {
        --end2;
        break;
      }
    }
    var remap, mapFrom;
    if (preserveItems) {
      remap = this.remapping(end2, this.items.length);
      mapFrom = remap.maps.length;
    }
    var transform = state2.tr;
    var selection, remaining;
    var addAfter = [], addBefore = [];
    this.items.forEach(function(item, i) {
      if (!item.step) {
        if (!remap) {
          remap = this$1.remapping(end2, i + 1);
          mapFrom = remap.maps.length;
        }
        mapFrom--;
        addBefore.push(item);
        return;
      }
      if (remap) {
        addBefore.push(new Item(item.map));
        var step2 = item.step.map(remap.slice(mapFrom)), map14;
        if (step2 && transform.maybeStep(step2).doc) {
          map14 = transform.mapping.maps[transform.mapping.maps.length - 1];
          addAfter.push(new Item(map14, null, null, addAfter.length + addBefore.length));
        }
        mapFrom--;
        if (map14) {
          remap.appendMap(map14, mapFrom);
        }
      } else {
        transform.maybeStep(item.step);
      }
      if (item.selection) {
        selection = remap ? item.selection.map(remap.slice(mapFrom)) : item.selection;
        remaining = new Branch(this$1.items.slice(0, end2).append(addBefore.reverse().concat(addAfter)), this$1.eventCount - 1);
        return false;
      }
    }, this.items.length, 0);
    return {remaining, transform, selection};
  };
  Branch.prototype.addTransform = function addTransform(transform, selection, histOptions, preserveItems) {
    var newItems = [], eventCount = this.eventCount;
    var oldItems = this.items, lastItem = !preserveItems && oldItems.length ? oldItems.get(oldItems.length - 1) : null;
    for (var i = 0; i < transform.steps.length; i++) {
      var step2 = transform.steps[i].invert(transform.docs[i]);
      var item = new Item(transform.mapping.maps[i], step2, selection), merged = void 0;
      if (merged = lastItem && lastItem.merge(item)) {
        item = merged;
        if (i) {
          newItems.pop();
        } else {
          oldItems = oldItems.slice(0, oldItems.length - 1);
        }
      }
      newItems.push(item);
      if (selection) {
        eventCount++;
        selection = null;
      }
      if (!preserveItems) {
        lastItem = item;
      }
    }
    var overflow = eventCount - histOptions.depth;
    if (overflow > DEPTH_OVERFLOW) {
      oldItems = cutOffEvents(oldItems, overflow);
      eventCount -= overflow;
    }
    return new Branch(oldItems.append(newItems), eventCount);
  };
  Branch.prototype.remapping = function remapping(from4, to) {
    var maps = new Mapping();
    this.items.forEach(function(item, i) {
      var mirrorPos = item.mirrorOffset != null && i - item.mirrorOffset >= from4 ? maps.maps.length - item.mirrorOffset : null;
      maps.appendMap(item.map, mirrorPos);
    }, from4, to);
    return maps;
  };
  Branch.prototype.addMaps = function addMaps(array) {
    if (this.eventCount == 0) {
      return this;
    }
    return new Branch(this.items.append(array.map(function(map14) {
      return new Item(map14);
    })), this.eventCount);
  };
  Branch.prototype.rebased = function rebased(rebasedTransform, rebasedCount) {
    if (!this.eventCount) {
      return this;
    }
    var rebasedItems = [], start3 = Math.max(0, this.items.length - rebasedCount);
    var mapping = rebasedTransform.mapping;
    var newUntil = rebasedTransform.steps.length;
    var eventCount = this.eventCount;
    this.items.forEach(function(item) {
      if (item.selection) {
        eventCount--;
      }
    }, start3);
    var iRebased = rebasedCount;
    this.items.forEach(function(item) {
      var pos = mapping.getMirror(--iRebased);
      if (pos == null) {
        return;
      }
      newUntil = Math.min(newUntil, pos);
      var map14 = mapping.maps[pos];
      if (item.step) {
        var step2 = rebasedTransform.steps[pos].invert(rebasedTransform.docs[pos]);
        var selection = item.selection && item.selection.map(mapping.slice(iRebased + 1, pos));
        if (selection) {
          eventCount++;
        }
        rebasedItems.push(new Item(map14, step2, selection));
      } else {
        rebasedItems.push(new Item(map14));
      }
    }, start3);
    var newMaps = [];
    for (var i = rebasedCount; i < newUntil; i++) {
      newMaps.push(new Item(mapping.maps[i]));
    }
    var items = this.items.slice(0, start3).append(newMaps).append(rebasedItems);
    var branch = new Branch(items, eventCount);
    if (branch.emptyItemCount() > max_empty_items) {
      branch = branch.compress(this.items.length - rebasedItems.length);
    }
    return branch;
  };
  Branch.prototype.emptyItemCount = function emptyItemCount() {
    var count = 0;
    this.items.forEach(function(item) {
      if (!item.step) {
        count++;
      }
    });
    return count;
  };
  Branch.prototype.compress = function compress(upto) {
    if (upto === void 0)
      upto = this.items.length;
    var remap = this.remapping(0, upto), mapFrom = remap.maps.length;
    var items = [], events = 0;
    this.items.forEach(function(item, i) {
      if (i >= upto) {
        items.push(item);
        if (item.selection) {
          events++;
        }
      } else if (item.step) {
        var step2 = item.step.map(remap.slice(mapFrom)), map14 = step2 && step2.getMap();
        mapFrom--;
        if (map14) {
          remap.appendMap(map14, mapFrom);
        }
        if (step2) {
          var selection = item.selection && item.selection.map(remap.slice(mapFrom));
          if (selection) {
            events++;
          }
          var newItem = new Item(map14.invert(), step2, selection), merged, last = items.length - 1;
          if (merged = items.length && items[last].merge(newItem)) {
            items[last] = merged;
          } else {
            items.push(newItem);
          }
        }
      } else if (item.map) {
        mapFrom--;
      }
    }, this.items.length, 0);
    return new Branch(index_es_default2.from(items.reverse()), events);
  };
  Branch.empty = new Branch(index_es_default2.empty, 0);
  function cutOffEvents(items, n) {
    var cutPoint;
    items.forEach(function(item, i) {
      if (item.selection && n-- == 0) {
        cutPoint = i;
        return false;
      }
    });
    return items.slice(cutPoint);
  }
  var Item = function Item2(map14, step2, selection, mirrorOffset) {
    this.map = map14;
    this.step = step2;
    this.selection = selection;
    this.mirrorOffset = mirrorOffset;
  };
  Item.prototype.merge = function merge2(other) {
    if (this.step && other.step && !other.selection) {
      var step2 = other.step.merge(this.step);
      if (step2) {
        return new Item(step2.getMap().invert(), step2, this.selection);
      }
    }
  };
  var HistoryState = function HistoryState2(done2, undone, prevRanges, prevTime) {
    this.done = done2;
    this.undone = undone;
    this.prevRanges = prevRanges;
    this.prevTime = prevTime;
  };
  var DEPTH_OVERFLOW = 20;
  function applyTransaction2(history2, state2, tr, options) {
    var historyTr = tr.getMeta(historyKey), rebased2;
    if (historyTr) {
      return historyTr.historyState;
    }
    if (tr.getMeta(closeHistoryKey)) {
      history2 = new HistoryState(history2.done, history2.undone, null, 0);
    }
    var appended = tr.getMeta("appendedTransaction");
    if (tr.steps.length == 0) {
      return history2;
    } else if (appended && appended.getMeta(historyKey)) {
      if (appended.getMeta(historyKey).redo) {
        return new HistoryState(history2.done.addTransform(tr, null, options, mustPreserveItems(state2)), history2.undone, rangesFor(tr.mapping.maps[tr.steps.length - 1]), history2.prevTime);
      } else {
        return new HistoryState(history2.done, history2.undone.addTransform(tr, null, options, mustPreserveItems(state2)), null, history2.prevTime);
      }
    } else if (tr.getMeta("addToHistory") !== false && !(appended && appended.getMeta("addToHistory") === false)) {
      var newGroup = history2.prevTime == 0 || !appended && (history2.prevTime < (tr.time || 0) - options.newGroupDelay || !isAdjacentTo(tr, history2.prevRanges));
      var prevRanges = appended ? mapRanges(history2.prevRanges, tr.mapping) : rangesFor(tr.mapping.maps[tr.steps.length - 1]);
      return new HistoryState(history2.done.addTransform(tr, newGroup ? state2.selection.getBookmark() : null, options, mustPreserveItems(state2)), Branch.empty, prevRanges, tr.time);
    } else if (rebased2 = tr.getMeta("rebased")) {
      return new HistoryState(history2.done.rebased(tr, rebased2), history2.undone.rebased(tr, rebased2), mapRanges(history2.prevRanges, tr.mapping), history2.prevTime);
    } else {
      return new HistoryState(history2.done.addMaps(tr.mapping.maps), history2.undone.addMaps(tr.mapping.maps), mapRanges(history2.prevRanges, tr.mapping), history2.prevTime);
    }
  }
  function isAdjacentTo(transform, prevRanges) {
    if (!prevRanges) {
      return false;
    }
    if (!transform.docChanged) {
      return true;
    }
    var adjacent = false;
    transform.mapping.maps[0].forEach(function(start3, end2) {
      for (var i = 0; i < prevRanges.length; i += 2) {
        if (start3 <= prevRanges[i + 1] && end2 >= prevRanges[i]) {
          adjacent = true;
        }
      }
    });
    return adjacent;
  }
  function rangesFor(map14) {
    var result2 = [];
    map14.forEach(function(_from, _to, from4, to) {
      return result2.push(from4, to);
    });
    return result2;
  }
  function mapRanges(ranges, mapping) {
    if (!ranges) {
      return null;
    }
    var result2 = [];
    for (var i = 0; i < ranges.length; i += 2) {
      var from4 = mapping.map(ranges[i], 1), to = mapping.map(ranges[i + 1], -1);
      if (from4 <= to) {
        result2.push(from4, to);
      }
    }
    return result2;
  }
  function histTransaction(history2, state2, dispatch2, redo2) {
    var preserveItems = mustPreserveItems(state2), histOptions = historyKey.get(state2).spec.config;
    var pop = (redo2 ? history2.undone : history2.done).popEvent(state2, preserveItems);
    if (!pop) {
      return;
    }
    var selection = pop.selection.resolve(pop.transform.doc);
    var added = (redo2 ? history2.done : history2.undone).addTransform(pop.transform, state2.selection.getBookmark(), histOptions, preserveItems);
    var newHist = new HistoryState(redo2 ? added : pop.remaining, redo2 ? pop.remaining : added, null, 0);
    dispatch2(pop.transform.setSelection(selection).setMeta(historyKey, {redo: redo2, historyState: newHist}).scrollIntoView());
  }
  var cachedPreserveItems = false;
  var cachedPreserveItemsPlugins = null;
  function mustPreserveItems(state2) {
    var plugins = state2.plugins;
    if (cachedPreserveItemsPlugins != plugins) {
      cachedPreserveItems = false;
      cachedPreserveItemsPlugins = plugins;
      for (var i = 0; i < plugins.length; i++) {
        if (plugins[i].spec.historyPreserveItems) {
          cachedPreserveItems = true;
          break;
        }
      }
    }
    return cachedPreserveItems;
  }
  var historyKey = new PluginKey("history");
  var closeHistoryKey = new PluginKey("closeHistory");
  function history(config) {
    config = {
      depth: config && config.depth || 100,
      newGroupDelay: config && config.newGroupDelay || 500
    };
    return new Plugin({
      key: historyKey,
      state: {
        init: function init5() {
          return new HistoryState(Branch.empty, Branch.empty, null, 0);
        },
        apply: function apply8(tr, hist, state2) {
          return applyTransaction2(hist, state2, tr, config);
        }
      },
      config,
      props: {
        handleDOMEvents: {
          beforeinput: function beforeinput(view2, e) {
            var handled = e.inputType == "historyUndo" ? undo(view2.state, view2.dispatch) : e.inputType == "historyRedo" ? redo(view2.state, view2.dispatch) : false;
            if (handled) {
              e.preventDefault();
            }
            return handled;
          }
        }
      }
    });
  }
  function undo(state2, dispatch2) {
    var hist = historyKey.getState(state2);
    if (!hist || hist.done.eventCount == 0) {
      return false;
    }
    if (dispatch2) {
      histTransaction(hist, state2, dispatch2, false);
    }
    return true;
  }
  function redo(state2, dispatch2) {
    var hist = historyKey.getState(state2);
    if (!hist || hist.undone.eventCount == 0) {
      return false;
    }
    if (dispatch2) {
      histTransaction(hist, state2, dispatch2, true);
    }
    return true;
  }

  // node_modules/w3c-keyname/index.es.js
  var base = {
    8: "Backspace",
    9: "Tab",
    10: "Enter",
    12: "NumLock",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    44: "PrintScreen",
    45: "Insert",
    46: "Delete",
    59: ";",
    61: "=",
    91: "Meta",
    92: "Meta",
    106: "*",
    107: "+",
    108: ",",
    109: "-",
    110: ".",
    111: "/",
    144: "NumLock",
    145: "ScrollLock",
    160: "Shift",
    161: "Shift",
    162: "Control",
    163: "Control",
    164: "Alt",
    165: "Alt",
    173: "-",
    186: ";",
    187: "=",
    188: ",",
    189: "-",
    190: ".",
    191: "/",
    192: "`",
    219: "[",
    220: "\\",
    221: "]",
    222: "'",
    229: "q"
  };
  var shift = {
    48: ")",
    49: "!",
    50: "@",
    51: "#",
    52: "$",
    53: "%",
    54: "^",
    55: "&",
    56: "*",
    57: "(",
    59: ":",
    61: "+",
    173: "_",
    186: ":",
    187: "+",
    188: "<",
    189: "_",
    190: ">",
    191: "?",
    192: "~",
    219: "{",
    220: "|",
    221: "}",
    222: '"',
    229: "Q"
  };
  var chrome = typeof navigator != "undefined" && /Chrome\/(\d+)/.exec(navigator.userAgent);
  var safari = typeof navigator != "undefined" && /Apple Computer/.test(navigator.vendor);
  var gecko = typeof navigator != "undefined" && /Gecko\/\d+/.test(navigator.userAgent);
  var mac2 = typeof navigator != "undefined" && /Mac/.test(navigator.platform);
  var ie = typeof navigator != "undefined" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
  var brokenModifierNames = chrome && (mac2 || +chrome[1] < 57) || gecko && mac2;
  for (var i = 0; i < 10; i++)
    base[48 + i] = base[96 + i] = String(i);
  for (var i = 1; i <= 24; i++)
    base[i + 111] = "F" + i;
  for (var i = 65; i <= 90; i++) {
    base[i] = String.fromCharCode(i + 32);
    shift[i] = String.fromCharCode(i);
  }
  for (var code2 in base)
    if (!shift.hasOwnProperty(code2))
      shift[code2] = base[code2];
  function keyName(event) {
    var ignoreKey = brokenModifierNames && (event.ctrlKey || event.altKey || event.metaKey) || (safari || ie) && event.shiftKey && event.key && event.key.length == 1;
    var name = !ignoreKey && event.key || (event.shiftKey ? shift : base)[event.keyCode] || event.key || "Unidentified";
    if (name == "Esc")
      name = "Escape";
    if (name == "Del")
      name = "Delete";
    if (name == "Left")
      name = "ArrowLeft";
    if (name == "Up")
      name = "ArrowUp";
    if (name == "Right")
      name = "ArrowRight";
    if (name == "Down")
      name = "ArrowDown";
    return name;
  }

  // node_modules/prosemirror-keymap/dist/index.es.js
  var mac3 = typeof navigator != "undefined" ? /Mac|iP(hone|[oa]d)/.test(navigator.platform) : false;
  function normalizeKeyName(name) {
    var parts = name.split(/-(?!$)/), result2 = parts[parts.length - 1];
    if (result2 == "Space") {
      result2 = " ";
    }
    var alt, ctrl, shift2, meta;
    for (var i = 0; i < parts.length - 1; i++) {
      var mod = parts[i];
      if (/^(cmd|meta|m)$/i.test(mod)) {
        meta = true;
      } else if (/^a(lt)?$/i.test(mod)) {
        alt = true;
      } else if (/^(c|ctrl|control)$/i.test(mod)) {
        ctrl = true;
      } else if (/^s(hift)?$/i.test(mod)) {
        shift2 = true;
      } else if (/^mod$/i.test(mod)) {
        if (mac3) {
          meta = true;
        } else {
          ctrl = true;
        }
      } else {
        throw new Error("Unrecognized modifier name: " + mod);
      }
    }
    if (alt) {
      result2 = "Alt-" + result2;
    }
    if (ctrl) {
      result2 = "Ctrl-" + result2;
    }
    if (meta) {
      result2 = "Meta-" + result2;
    }
    if (shift2) {
      result2 = "Shift-" + result2;
    }
    return result2;
  }
  function normalize(map14) {
    var copy5 = Object.create(null);
    for (var prop in map14) {
      copy5[normalizeKeyName(prop)] = map14[prop];
    }
    return copy5;
  }
  function modifiers(name, event, shift2) {
    if (event.altKey) {
      name = "Alt-" + name;
    }
    if (event.ctrlKey) {
      name = "Ctrl-" + name;
    }
    if (event.metaKey) {
      name = "Meta-" + name;
    }
    if (shift2 !== false && event.shiftKey) {
      name = "Shift-" + name;
    }
    return name;
  }
  function keymap(bindings) {
    return new Plugin({props: {handleKeyDown: keydownHandler(bindings)}});
  }
  function keydownHandler(bindings) {
    var map14 = normalize(bindings);
    return function(view2, event) {
      var name = keyName(event), isChar = name.length == 1 && name != " ", baseName;
      var direct = map14[modifiers(name, event, !isChar)];
      if (direct && direct(view2.state, view2.dispatch, view2)) {
        return true;
      }
      if (isChar && (event.shiftKey || event.altKey || event.metaKey || name.charCodeAt(0) > 127) && (baseName = base[event.keyCode]) && baseName != name) {
        var fromCode = map14[modifiers(baseName, event, true)];
        if (fromCode && fromCode(view2.state, view2.dispatch, view2)) {
          return true;
        }
      } else if (isChar && event.shiftKey) {
        var withShift = map14[modifiers(name, event, true)];
        if (withShift && withShift(view2.state, view2.dispatch, view2)) {
          return true;
        }
      }
      return false;
    };
  }

  // node_modules/prosemirror-view/dist/index.es.js
  var result = {};
  if (typeof navigator != "undefined" && typeof document != "undefined") {
    ie_edge = /Edge\/(\d+)/.exec(navigator.userAgent);
    ie_upto10 = /MSIE \d/.test(navigator.userAgent);
    ie_11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
    ie2 = result.ie = !!(ie_upto10 || ie_11up || ie_edge);
    result.ie_version = ie_upto10 ? document.documentMode || 6 : ie_11up ? +ie_11up[1] : ie_edge ? +ie_edge[1] : null;
    result.gecko = !ie2 && /gecko\/(\d+)/i.test(navigator.userAgent);
    result.gecko_version = result.gecko && +(/Firefox\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1];
    chrome2 = !ie2 && /Chrome\/(\d+)/.exec(navigator.userAgent);
    result.chrome = !!chrome2;
    result.chrome_version = chrome2 && +chrome2[1];
    result.safari = !ie2 && /Apple Computer/.test(navigator.vendor);
    result.ios = result.safari && (/Mobile\/\w+/.test(navigator.userAgent) || navigator.maxTouchPoints > 2);
    result.mac = result.ios || /Mac/.test(navigator.platform);
    result.android = /Android \d/.test(navigator.userAgent);
    result.webkit = "webkitFontSmoothing" in document.documentElement.style;
    result.webkit_version = result.webkit && +(/\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1];
  }
  var ie_edge;
  var ie_upto10;
  var ie_11up;
  var ie2;
  var chrome2;
  var domIndex = function(node4) {
    for (var index2 = 0; ; index2++) {
      node4 = node4.previousSibling;
      if (!node4) {
        return index2;
      }
    }
  };
  var parentNode = function(node4) {
    var parent = node4.assignedSlot || node4.parentNode;
    return parent && parent.nodeType == 11 ? parent.host : parent;
  };
  var reusedRange = null;
  var textRange = function(node4, from4, to) {
    var range = reusedRange || (reusedRange = document.createRange());
    range.setEnd(node4, to == null ? node4.nodeValue.length : to);
    range.setStart(node4, from4 || 0);
    return range;
  };
  var isEquivalentPosition = function(node4, off, targetNode, targetOff) {
    return targetNode && (scanFor(node4, off, targetNode, targetOff, -1) || scanFor(node4, off, targetNode, targetOff, 1));
  };
  var atomElements = /^(img|br|input|textarea|hr)$/i;
  function scanFor(node4, off, targetNode, targetOff, dir) {
    for (; ; ) {
      if (node4 == targetNode && off == targetOff) {
        return true;
      }
      if (off == (dir < 0 ? 0 : nodeSize(node4))) {
        var parent = node4.parentNode;
        if (parent.nodeType != 1 || hasBlockDesc(node4) || atomElements.test(node4.nodeName) || node4.contentEditable == "false") {
          return false;
        }
        off = domIndex(node4) + (dir < 0 ? 0 : 1);
        node4 = parent;
      } else if (node4.nodeType == 1) {
        node4 = node4.childNodes[off + (dir < 0 ? -1 : 0)];
        if (node4.contentEditable == "false") {
          return false;
        }
        off = dir < 0 ? nodeSize(node4) : 0;
      } else {
        return false;
      }
    }
  }
  function nodeSize(node4) {
    return node4.nodeType == 3 ? node4.nodeValue.length : node4.childNodes.length;
  }
  function isOnEdge(node4, offset2, parent) {
    for (var atStart2 = offset2 == 0, atEnd2 = offset2 == nodeSize(node4); atStart2 || atEnd2; ) {
      if (node4 == parent) {
        return true;
      }
      var index2 = domIndex(node4);
      node4 = node4.parentNode;
      if (!node4) {
        return false;
      }
      atStart2 = atStart2 && index2 == 0;
      atEnd2 = atEnd2 && index2 == nodeSize(node4);
    }
  }
  function hasBlockDesc(dom) {
    var desc;
    for (var cur = dom; cur; cur = cur.parentNode) {
      if (desc = cur.pmViewDesc) {
        break;
      }
    }
    return desc && desc.node && desc.node.isBlock && (desc.dom == dom || desc.contentDOM == dom);
  }
  var selectionCollapsed = function(domSel) {
    var collapsed = domSel.isCollapsed;
    if (collapsed && result.chrome && domSel.rangeCount && !domSel.getRangeAt(0).collapsed) {
      collapsed = false;
    }
    return collapsed;
  };
  function keyEvent(keyCode, key) {
    var event = document.createEvent("Event");
    event.initEvent("keydown", true, true);
    event.keyCode = keyCode;
    event.key = event.code = key;
    return event;
  }
  function windowRect(doc2) {
    return {
      left: 0,
      right: doc2.documentElement.clientWidth,
      top: 0,
      bottom: doc2.documentElement.clientHeight
    };
  }
  function getSide(value, side) {
    return typeof value == "number" ? value : value[side];
  }
  function clientRect(node4) {
    var rect = node4.getBoundingClientRect();
    var scaleX = rect.width / node4.offsetWidth || 1;
    var scaleY = rect.height / node4.offsetHeight || 1;
    return {
      left: rect.left,
      right: rect.left + node4.clientWidth * scaleX,
      top: rect.top,
      bottom: rect.top + node4.clientHeight * scaleY
    };
  }
  function scrollRectIntoView(view2, rect, startDOM) {
    var scrollThreshold = view2.someProp("scrollThreshold") || 0, scrollMargin = view2.someProp("scrollMargin") || 5;
    var doc2 = view2.dom.ownerDocument;
    for (var parent = startDOM || view2.dom; ; parent = parentNode(parent)) {
      if (!parent) {
        break;
      }
      if (parent.nodeType != 1) {
        continue;
      }
      var atTop = parent == doc2.body || parent.nodeType != 1;
      var bounding = atTop ? windowRect(doc2) : clientRect(parent);
      var moveX = 0, moveY = 0;
      if (rect.top < bounding.top + getSide(scrollThreshold, "top")) {
        moveY = -(bounding.top - rect.top + getSide(scrollMargin, "top"));
      } else if (rect.bottom > bounding.bottom - getSide(scrollThreshold, "bottom")) {
        moveY = rect.bottom - bounding.bottom + getSide(scrollMargin, "bottom");
      }
      if (rect.left < bounding.left + getSide(scrollThreshold, "left")) {
        moveX = -(bounding.left - rect.left + getSide(scrollMargin, "left"));
      } else if (rect.right > bounding.right - getSide(scrollThreshold, "right")) {
        moveX = rect.right - bounding.right + getSide(scrollMargin, "right");
      }
      if (moveX || moveY) {
        if (atTop) {
          doc2.defaultView.scrollBy(moveX, moveY);
        } else {
          var startX = parent.scrollLeft, startY = parent.scrollTop;
          if (moveY) {
            parent.scrollTop += moveY;
          }
          if (moveX) {
            parent.scrollLeft += moveX;
          }
          var dX = parent.scrollLeft - startX, dY = parent.scrollTop - startY;
          rect = {left: rect.left - dX, top: rect.top - dY, right: rect.right - dX, bottom: rect.bottom - dY};
        }
      }
      if (atTop) {
        break;
      }
    }
  }
  function storeScrollPos(view2) {
    var rect = view2.dom.getBoundingClientRect(), startY = Math.max(0, rect.top);
    var refDOM, refTop;
    for (var x = (rect.left + rect.right) / 2, y = startY + 1; y < Math.min(innerHeight, rect.bottom); y += 5) {
      var dom = view2.root.elementFromPoint(x, y);
      if (dom == view2.dom || !view2.dom.contains(dom)) {
        continue;
      }
      var localRect = dom.getBoundingClientRect();
      if (localRect.top >= startY - 20) {
        refDOM = dom;
        refTop = localRect.top;
        break;
      }
    }
    return {refDOM, refTop, stack: scrollStack(view2.dom)};
  }
  function scrollStack(dom) {
    var stack = [], doc2 = dom.ownerDocument;
    for (; dom; dom = parentNode(dom)) {
      stack.push({dom, top: dom.scrollTop, left: dom.scrollLeft});
      if (dom == doc2) {
        break;
      }
    }
    return stack;
  }
  function resetScrollPos(ref) {
    var refDOM = ref.refDOM;
    var refTop = ref.refTop;
    var stack = ref.stack;
    var newRefTop = refDOM ? refDOM.getBoundingClientRect().top : 0;
    restoreScrollStack(stack, newRefTop == 0 ? 0 : newRefTop - refTop);
  }
  function restoreScrollStack(stack, dTop) {
    for (var i = 0; i < stack.length; i++) {
      var ref = stack[i];
      var dom = ref.dom;
      var top = ref.top;
      var left = ref.left;
      if (dom.scrollTop != top + dTop) {
        dom.scrollTop = top + dTop;
      }
      if (dom.scrollLeft != left) {
        dom.scrollLeft = left;
      }
    }
  }
  var preventScrollSupported = null;
  function focusPreventScroll(dom) {
    if (dom.setActive) {
      return dom.setActive();
    }
    if (preventScrollSupported) {
      return dom.focus(preventScrollSupported);
    }
    var stored = scrollStack(dom);
    dom.focus(preventScrollSupported == null ? {
      get preventScroll() {
        preventScrollSupported = {preventScroll: true};
        return true;
      }
    } : void 0);
    if (!preventScrollSupported) {
      preventScrollSupported = false;
      restoreScrollStack(stored, 0);
    }
  }
  function findOffsetInNode(node4, coords) {
    var closest, dxClosest = 2e8, coordsClosest, offset2 = 0;
    var rowBot = coords.top, rowTop = coords.top;
    for (var child3 = node4.firstChild, childIndex = 0; child3; child3 = child3.nextSibling, childIndex++) {
      var rects = void 0;
      if (child3.nodeType == 1) {
        rects = child3.getClientRects();
      } else if (child3.nodeType == 3) {
        rects = textRange(child3).getClientRects();
      } else {
        continue;
      }
      for (var i = 0; i < rects.length; i++) {
        var rect = rects[i];
        if (rect.top <= rowBot && rect.bottom >= rowTop) {
          rowBot = Math.max(rect.bottom, rowBot);
          rowTop = Math.min(rect.top, rowTop);
          var dx = rect.left > coords.left ? rect.left - coords.left : rect.right < coords.left ? coords.left - rect.right : 0;
          if (dx < dxClosest) {
            closest = child3;
            dxClosest = dx;
            coordsClosest = dx && closest.nodeType == 3 ? {left: rect.right < coords.left ? rect.right : rect.left, top: coords.top} : coords;
            if (child3.nodeType == 1 && dx) {
              offset2 = childIndex + (coords.left >= (rect.left + rect.right) / 2 ? 1 : 0);
            }
            continue;
          }
        }
        if (!closest && (coords.left >= rect.right && coords.top >= rect.top || coords.left >= rect.left && coords.top >= rect.bottom)) {
          offset2 = childIndex + 1;
        }
      }
    }
    if (closest && closest.nodeType == 3) {
      return findOffsetInText(closest, coordsClosest);
    }
    if (!closest || dxClosest && closest.nodeType == 1) {
      return {node: node4, offset: offset2};
    }
    return findOffsetInNode(closest, coordsClosest);
  }
  function findOffsetInText(node4, coords) {
    var len = node4.nodeValue.length;
    var range = document.createRange();
    for (var i = 0; i < len; i++) {
      range.setEnd(node4, i + 1);
      range.setStart(node4, i);
      var rect = singleRect(range, 1);
      if (rect.top == rect.bottom) {
        continue;
      }
      if (inRect(coords, rect)) {
        return {node: node4, offset: i + (coords.left >= (rect.left + rect.right) / 2 ? 1 : 0)};
      }
    }
    return {node: node4, offset: 0};
  }
  function inRect(coords, rect) {
    return coords.left >= rect.left - 1 && coords.left <= rect.right + 1 && coords.top >= rect.top - 1 && coords.top <= rect.bottom + 1;
  }
  function targetKludge(dom, coords) {
    var parent = dom.parentNode;
    if (parent && /^li$/i.test(parent.nodeName) && coords.left < dom.getBoundingClientRect().left) {
      return parent;
    }
    return dom;
  }
  function posFromElement(view2, elt, coords) {
    var ref = findOffsetInNode(elt, coords);
    var node4 = ref.node;
    var offset2 = ref.offset;
    var bias = -1;
    if (node4.nodeType == 1 && !node4.firstChild) {
      var rect = node4.getBoundingClientRect();
      bias = rect.left != rect.right && coords.left > (rect.left + rect.right) / 2 ? 1 : -1;
    }
    return view2.docView.posFromDOM(node4, offset2, bias);
  }
  function posFromCaret(view2, node4, offset2, coords) {
    var outside = -1;
    for (var cur = node4; ; ) {
      if (cur == view2.dom) {
        break;
      }
      var desc = view2.docView.nearestDesc(cur, true);
      if (!desc) {
        return null;
      }
      if (desc.node.isBlock && desc.parent) {
        var rect = desc.dom.getBoundingClientRect();
        if (rect.left > coords.left || rect.top > coords.top) {
          outside = desc.posBefore;
        } else if (rect.right < coords.left || rect.bottom < coords.top) {
          outside = desc.posAfter;
        } else {
          break;
        }
      }
      cur = desc.dom.parentNode;
    }
    return outside > -1 ? outside : view2.docView.posFromDOM(node4, offset2);
  }
  function elementFromPoint(element, coords, box) {
    var len = element.childNodes.length;
    if (len && box.top < box.bottom) {
      for (var startI = Math.max(0, Math.min(len - 1, Math.floor(len * (coords.top - box.top) / (box.bottom - box.top)) - 2)), i = startI; ; ) {
        var child3 = element.childNodes[i];
        if (child3.nodeType == 1) {
          var rects = child3.getClientRects();
          for (var j = 0; j < rects.length; j++) {
            var rect = rects[j];
            if (inRect(coords, rect)) {
              return elementFromPoint(child3, coords, rect);
            }
          }
        }
        if ((i = (i + 1) % len) == startI) {
          break;
        }
      }
    }
    return element;
  }
  function posAtCoords(view2, coords) {
    var assign, assign$1;
    var doc2 = view2.dom.ownerDocument, node4, offset2;
    if (doc2.caretPositionFromPoint) {
      try {
        var pos$1 = doc2.caretPositionFromPoint(coords.left, coords.top);
        if (pos$1) {
          assign = pos$1, node4 = assign.offsetNode, offset2 = assign.offset;
        }
      } catch (_) {
      }
    }
    if (!node4 && doc2.caretRangeFromPoint) {
      var range = doc2.caretRangeFromPoint(coords.left, coords.top);
      if (range) {
        assign$1 = range, node4 = assign$1.startContainer, offset2 = assign$1.startOffset;
      }
    }
    var elt = (view2.root.elementFromPoint ? view2.root : doc2).elementFromPoint(coords.left, coords.top + 1), pos;
    if (!elt || !view2.dom.contains(elt.nodeType != 1 ? elt.parentNode : elt)) {
      var box = view2.dom.getBoundingClientRect();
      if (!inRect(coords, box)) {
        return null;
      }
      elt = elementFromPoint(view2.dom, coords, box);
      if (!elt) {
        return null;
      }
    }
    if (result.safari) {
      for (var p = elt; node4 && p; p = parentNode(p)) {
        if (p.draggable) {
          node4 = offset2 = null;
        }
      }
    }
    elt = targetKludge(elt, coords);
    if (node4) {
      if (result.gecko && node4.nodeType == 1) {
        offset2 = Math.min(offset2, node4.childNodes.length);
        if (offset2 < node4.childNodes.length) {
          var next = node4.childNodes[offset2], box$1;
          if (next.nodeName == "IMG" && (box$1 = next.getBoundingClientRect()).right <= coords.left && box$1.bottom > coords.top) {
            offset2++;
          }
        }
      }
      if (node4 == view2.dom && offset2 == node4.childNodes.length - 1 && node4.lastChild.nodeType == 1 && coords.top > node4.lastChild.getBoundingClientRect().bottom) {
        pos = view2.state.doc.content.size;
      } else if (offset2 == 0 || node4.nodeType != 1 || node4.childNodes[offset2 - 1].nodeName != "BR") {
        pos = posFromCaret(view2, node4, offset2, coords);
      }
    }
    if (pos == null) {
      pos = posFromElement(view2, elt, coords);
    }
    var desc = view2.docView.nearestDesc(elt, true);
    return {pos, inside: desc ? desc.posAtStart - desc.border : -1};
  }
  function singleRect(object, bias) {
    var rects = object.getClientRects();
    return !rects.length ? object.getBoundingClientRect() : rects[bias < 0 ? 0 : rects.length - 1];
  }
  var BIDI = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
  function coordsAtPos(view2, pos, side) {
    var ref = view2.docView.domFromPos(pos, side < 0 ? -1 : 1);
    var node4 = ref.node;
    var offset2 = ref.offset;
    var supportEmptyRange = result.webkit || result.gecko;
    if (node4.nodeType == 3) {
      if (supportEmptyRange && (BIDI.test(node4.nodeValue) || (side < 0 ? !offset2 : offset2 == node4.nodeValue.length))) {
        var rect = singleRect(textRange(node4, offset2, offset2), side);
        if (result.gecko && offset2 && /\s/.test(node4.nodeValue[offset2 - 1]) && offset2 < node4.nodeValue.length) {
          var rectBefore = singleRect(textRange(node4, offset2 - 1, offset2 - 1), -1);
          if (rectBefore.top == rect.top) {
            var rectAfter = singleRect(textRange(node4, offset2, offset2 + 1), -1);
            if (rectAfter.top != rect.top) {
              return flattenV(rectAfter, rectAfter.left < rectBefore.left);
            }
          }
        }
        return rect;
      } else {
        var from4 = offset2, to = offset2, takeSide = side < 0 ? 1 : -1;
        if (side < 0 && !offset2) {
          to++;
          takeSide = -1;
        } else if (side >= 0 && offset2 == node4.nodeValue.length) {
          from4--;
          takeSide = 1;
        } else if (side < 0) {
          from4--;
        } else {
          to++;
        }
        return flattenV(singleRect(textRange(node4, from4, to), takeSide), takeSide < 0);
      }
    }
    if (!view2.state.doc.resolve(pos).parent.inlineContent) {
      if (offset2 && (side < 0 || offset2 == nodeSize(node4))) {
        var before2 = node4.childNodes[offset2 - 1];
        if (before2.nodeType == 1) {
          return flattenH(before2.getBoundingClientRect(), false);
        }
      }
      if (offset2 < nodeSize(node4)) {
        var after2 = node4.childNodes[offset2];
        if (after2.nodeType == 1) {
          return flattenH(after2.getBoundingClientRect(), true);
        }
      }
      return flattenH(node4.getBoundingClientRect(), side >= 0);
    }
    if (offset2 && (side < 0 || offset2 == nodeSize(node4))) {
      var before$1 = node4.childNodes[offset2 - 1];
      var target = before$1.nodeType == 3 ? textRange(before$1, nodeSize(before$1) - (supportEmptyRange ? 0 : 1)) : before$1.nodeType == 1 && (before$1.nodeName != "BR" || !before$1.nextSibling) ? before$1 : null;
      if (target) {
        return flattenV(singleRect(target, 1), false);
      }
    }
    if (offset2 < nodeSize(node4)) {
      var after$1 = node4.childNodes[offset2];
      while (after$1.pmViewDesc && after$1.pmViewDesc.ignoreForCoords) {
        after$1 = after$1.nextSibling;
      }
      var target$1 = !after$1 ? null : after$1.nodeType == 3 ? textRange(after$1, 0, supportEmptyRange ? 0 : 1) : after$1.nodeType == 1 ? after$1 : null;
      if (target$1) {
        return flattenV(singleRect(target$1, -1), true);
      }
    }
    return flattenV(singleRect(node4.nodeType == 3 ? textRange(node4) : node4, -side), side >= 0);
  }
  function flattenV(rect, left) {
    if (rect.width == 0) {
      return rect;
    }
    var x = left ? rect.left : rect.right;
    return {top: rect.top, bottom: rect.bottom, left: x, right: x};
  }
  function flattenH(rect, top) {
    if (rect.height == 0) {
      return rect;
    }
    var y = top ? rect.top : rect.bottom;
    return {top: y, bottom: y, left: rect.left, right: rect.right};
  }
  function withFlushedState(view2, state2, f) {
    var viewState = view2.state, active = view2.root.activeElement;
    if (viewState != state2) {
      view2.updateState(state2);
    }
    if (active != view2.dom) {
      view2.focus();
    }
    try {
      return f();
    } finally {
      if (viewState != state2) {
        view2.updateState(viewState);
      }
      if (active != view2.dom && active) {
        active.focus();
      }
    }
  }
  function endOfTextblockVertical(view2, state2, dir) {
    var sel = state2.selection;
    var $pos = dir == "up" ? sel.$from : sel.$to;
    return withFlushedState(view2, state2, function() {
      var ref = view2.docView.domFromPos($pos.pos, dir == "up" ? -1 : 1);
      var dom = ref.node;
      for (; ; ) {
        var nearest = view2.docView.nearestDesc(dom, true);
        if (!nearest) {
          break;
        }
        if (nearest.node.isBlock) {
          dom = nearest.dom;
          break;
        }
        dom = nearest.dom.parentNode;
      }
      var coords = coordsAtPos(view2, $pos.pos, 1);
      for (var child3 = dom.firstChild; child3; child3 = child3.nextSibling) {
        var boxes = void 0;
        if (child3.nodeType == 1) {
          boxes = child3.getClientRects();
        } else if (child3.nodeType == 3) {
          boxes = textRange(child3, 0, child3.nodeValue.length).getClientRects();
        } else {
          continue;
        }
        for (var i = 0; i < boxes.length; i++) {
          var box = boxes[i];
          if (box.bottom > box.top + 1 && (dir == "up" ? coords.top - box.top > (box.bottom - coords.top) * 2 : box.bottom - coords.bottom > (coords.bottom - box.top) * 2)) {
            return false;
          }
        }
      }
      return true;
    });
  }
  var maybeRTL = /[\u0590-\u08ac]/;
  function endOfTextblockHorizontal(view2, state2, dir) {
    var ref = state2.selection;
    var $head = ref.$head;
    if (!$head.parent.isTextblock) {
      return false;
    }
    var offset2 = $head.parentOffset, atStart2 = !offset2, atEnd2 = offset2 == $head.parent.content.size;
    var sel = view2.root.getSelection();
    if (!maybeRTL.test($head.parent.textContent) || !sel.modify) {
      return dir == "left" || dir == "backward" ? atStart2 : atEnd2;
    }
    return withFlushedState(view2, state2, function() {
      var oldRange = sel.getRangeAt(0), oldNode = sel.focusNode, oldOff = sel.focusOffset;
      var oldBidiLevel = sel.caretBidiLevel;
      sel.modify("move", dir, "character");
      var parentDOM = $head.depth ? view2.docView.domAfterPos($head.before()) : view2.dom;
      var result2 = !parentDOM.contains(sel.focusNode.nodeType == 1 ? sel.focusNode : sel.focusNode.parentNode) || oldNode == sel.focusNode && oldOff == sel.focusOffset;
      sel.removeAllRanges();
      sel.addRange(oldRange);
      if (oldBidiLevel != null) {
        sel.caretBidiLevel = oldBidiLevel;
      }
      return result2;
    });
  }
  var cachedState = null;
  var cachedDir = null;
  var cachedResult = false;
  function endOfTextblock(view2, state2, dir) {
    if (cachedState == state2 && cachedDir == dir) {
      return cachedResult;
    }
    cachedState = state2;
    cachedDir = dir;
    return cachedResult = dir == "up" || dir == "down" ? endOfTextblockVertical(view2, state2, dir) : endOfTextblockHorizontal(view2, state2, dir);
  }
  var NOT_DIRTY = 0;
  var CHILD_DIRTY = 1;
  var CONTENT_DIRTY = 2;
  var NODE_DIRTY = 3;
  var ViewDesc = function ViewDesc2(parent, children, dom, contentDOM) {
    this.parent = parent;
    this.children = children;
    this.dom = dom;
    dom.pmViewDesc = this;
    this.contentDOM = contentDOM;
    this.dirty = NOT_DIRTY;
  };
  var prototypeAccessors4 = {size: {configurable: true}, border: {configurable: true}, posBefore: {configurable: true}, posAtStart: {configurable: true}, posAfter: {configurable: true}, posAtEnd: {configurable: true}, contentLost: {configurable: true}, domAtom: {configurable: true}, ignoreForCoords: {configurable: true}};
  ViewDesc.prototype.matchesWidget = function matchesWidget() {
    return false;
  };
  ViewDesc.prototype.matchesMark = function matchesMark() {
    return false;
  };
  ViewDesc.prototype.matchesNode = function matchesNode() {
    return false;
  };
  ViewDesc.prototype.matchesHack = function matchesHack(_nodeName) {
    return false;
  };
  ViewDesc.prototype.parseRule = function parseRule() {
    return null;
  };
  ViewDesc.prototype.stopEvent = function stopEvent() {
    return false;
  };
  prototypeAccessors4.size.get = function() {
    var size = 0;
    for (var i = 0; i < this.children.length; i++) {
      size += this.children[i].size;
    }
    return size;
  };
  prototypeAccessors4.border.get = function() {
    return 0;
  };
  ViewDesc.prototype.destroy = function destroy() {
    this.parent = null;
    if (this.dom.pmViewDesc == this) {
      this.dom.pmViewDesc = null;
    }
    for (var i = 0; i < this.children.length; i++) {
      this.children[i].destroy();
    }
  };
  ViewDesc.prototype.posBeforeChild = function posBeforeChild(child3) {
    for (var i = 0, pos = this.posAtStart; i < this.children.length; i++) {
      var cur = this.children[i];
      if (cur == child3) {
        return pos;
      }
      pos += cur.size;
    }
  };
  prototypeAccessors4.posBefore.get = function() {
    return this.parent.posBeforeChild(this);
  };
  prototypeAccessors4.posAtStart.get = function() {
    return this.parent ? this.parent.posBeforeChild(this) + this.border : 0;
  };
  prototypeAccessors4.posAfter.get = function() {
    return this.posBefore + this.size;
  };
  prototypeAccessors4.posAtEnd.get = function() {
    return this.posAtStart + this.size - 2 * this.border;
  };
  ViewDesc.prototype.localPosFromDOM = function localPosFromDOM(dom, offset2, bias) {
    if (this.contentDOM && this.contentDOM.contains(dom.nodeType == 1 ? dom : dom.parentNode)) {
      if (bias < 0) {
        var domBefore, desc;
        if (dom == this.contentDOM) {
          domBefore = dom.childNodes[offset2 - 1];
        } else {
          while (dom.parentNode != this.contentDOM) {
            dom = dom.parentNode;
          }
          domBefore = dom.previousSibling;
        }
        while (domBefore && !((desc = domBefore.pmViewDesc) && desc.parent == this)) {
          domBefore = domBefore.previousSibling;
        }
        return domBefore ? this.posBeforeChild(desc) + desc.size : this.posAtStart;
      } else {
        var domAfter, desc$1;
        if (dom == this.contentDOM) {
          domAfter = dom.childNodes[offset2];
        } else {
          while (dom.parentNode != this.contentDOM) {
            dom = dom.parentNode;
          }
          domAfter = dom.nextSibling;
        }
        while (domAfter && !((desc$1 = domAfter.pmViewDesc) && desc$1.parent == this)) {
          domAfter = domAfter.nextSibling;
        }
        return domAfter ? this.posBeforeChild(desc$1) : this.posAtEnd;
      }
    }
    var atEnd2;
    if (dom == this.dom && this.contentDOM) {
      atEnd2 = offset2 > domIndex(this.contentDOM);
    } else if (this.contentDOM && this.contentDOM != this.dom && this.dom.contains(this.contentDOM)) {
      atEnd2 = dom.compareDocumentPosition(this.contentDOM) & 2;
    } else if (this.dom.firstChild) {
      if (offset2 == 0) {
        for (var search = dom; ; search = search.parentNode) {
          if (search == this.dom) {
            atEnd2 = false;
            break;
          }
          if (search.parentNode.firstChild != search) {
            break;
          }
        }
      }
      if (atEnd2 == null && offset2 == dom.childNodes.length) {
        for (var search$1 = dom; ; search$1 = search$1.parentNode) {
          if (search$1 == this.dom) {
            atEnd2 = true;
            break;
          }
          if (search$1.parentNode.lastChild != search$1) {
            break;
          }
        }
      }
    }
    return (atEnd2 == null ? bias > 0 : atEnd2) ? this.posAtEnd : this.posAtStart;
  };
  ViewDesc.prototype.nearestDesc = function nearestDesc(dom, onlyNodes) {
    for (var first = true, cur = dom; cur; cur = cur.parentNode) {
      var desc = this.getDesc(cur);
      if (desc && (!onlyNodes || desc.node)) {
        if (first && desc.nodeDOM && !(desc.nodeDOM.nodeType == 1 ? desc.nodeDOM.contains(dom.nodeType == 1 ? dom : dom.parentNode) : desc.nodeDOM == dom)) {
          first = false;
        } else {
          return desc;
        }
      }
    }
  };
  ViewDesc.prototype.getDesc = function getDesc(dom) {
    var desc = dom.pmViewDesc;
    for (var cur = desc; cur; cur = cur.parent) {
      if (cur == this) {
        return desc;
      }
    }
  };
  ViewDesc.prototype.posFromDOM = function posFromDOM(dom, offset2, bias) {
    for (var scan = dom; scan; scan = scan.parentNode) {
      var desc = this.getDesc(scan);
      if (desc) {
        return desc.localPosFromDOM(dom, offset2, bias);
      }
    }
    return -1;
  };
  ViewDesc.prototype.descAt = function descAt(pos) {
    for (var i = 0, offset2 = 0; i < this.children.length; i++) {
      var child3 = this.children[i], end2 = offset2 + child3.size;
      if (offset2 == pos && end2 != offset2) {
        while (!child3.border && child3.children.length) {
          child3 = child3.children[0];
        }
        return child3;
      }
      if (pos < end2) {
        return child3.descAt(pos - offset2 - child3.border);
      }
      offset2 = end2;
    }
  };
  ViewDesc.prototype.domFromPos = function domFromPos(pos, side) {
    if (!this.contentDOM) {
      return {node: this.dom, offset: 0};
    }
    var i = 0, offset2 = 0;
    for (var curPos = 0; i < this.children.length; i++) {
      var child3 = this.children[i], end2 = curPos + child3.size;
      if (end2 > pos || child3 instanceof TrailingHackViewDesc) {
        offset2 = pos - curPos;
        break;
      }
      curPos = end2;
    }
    if (offset2) {
      return this.children[i].domFromPos(offset2 - this.children[i].border, side);
    }
    for (var prev = void 0; i && !(prev = this.children[i - 1]).size && prev instanceof WidgetViewDesc && prev.widget.type.side >= 0; i--) {
    }
    if (side <= 0) {
      var prev$1, enter2 = true;
      for (; ; i--, enter2 = false) {
        prev$1 = i ? this.children[i - 1] : null;
        if (!prev$1 || prev$1.dom.parentNode == this.contentDOM) {
          break;
        }
      }
      if (prev$1 && side && enter2 && !prev$1.border && !prev$1.domAtom) {
        return prev$1.domFromPos(prev$1.size, side);
      }
      return {node: this.contentDOM, offset: prev$1 ? domIndex(prev$1.dom) + 1 : 0};
    } else {
      var next, enter$1 = true;
      for (; ; i++, enter$1 = false) {
        next = i < this.children.length ? this.children[i] : null;
        if (!next || next.dom.parentNode == this.contentDOM) {
          break;
        }
      }
      if (next && enter$1 && !next.border && !next.domAtom) {
        return next.domFromPos(0, side);
      }
      return {node: this.contentDOM, offset: next ? domIndex(next.dom) : this.contentDOM.childNodes.length};
    }
  };
  ViewDesc.prototype.parseRange = function parseRange(from4, to, base2) {
    if (base2 === void 0)
      base2 = 0;
    if (this.children.length == 0) {
      return {node: this.contentDOM, from: from4, to, fromOffset: 0, toOffset: this.contentDOM.childNodes.length};
    }
    var fromOffset = -1, toOffset = -1;
    for (var offset2 = base2, i = 0; ; i++) {
      var child3 = this.children[i], end2 = offset2 + child3.size;
      if (fromOffset == -1 && from4 <= end2) {
        var childBase = offset2 + child3.border;
        if (from4 >= childBase && to <= end2 - child3.border && child3.node && child3.contentDOM && this.contentDOM.contains(child3.contentDOM)) {
          return child3.parseRange(from4, to, childBase);
        }
        from4 = offset2;
        for (var j = i; j > 0; j--) {
          var prev = this.children[j - 1];
          if (prev.size && prev.dom.parentNode == this.contentDOM && !prev.emptyChildAt(1)) {
            fromOffset = domIndex(prev.dom) + 1;
            break;
          }
          from4 -= prev.size;
        }
        if (fromOffset == -1) {
          fromOffset = 0;
        }
      }
      if (fromOffset > -1 && (end2 > to || i == this.children.length - 1)) {
        to = end2;
        for (var j$1 = i + 1; j$1 < this.children.length; j$1++) {
          var next = this.children[j$1];
          if (next.size && next.dom.parentNode == this.contentDOM && !next.emptyChildAt(-1)) {
            toOffset = domIndex(next.dom);
            break;
          }
          to += next.size;
        }
        if (toOffset == -1) {
          toOffset = this.contentDOM.childNodes.length;
        }
        break;
      }
      offset2 = end2;
    }
    return {node: this.contentDOM, from: from4, to, fromOffset, toOffset};
  };
  ViewDesc.prototype.emptyChildAt = function emptyChildAt(side) {
    if (this.border || !this.contentDOM || !this.children.length) {
      return false;
    }
    var child3 = this.children[side < 0 ? 0 : this.children.length - 1];
    return child3.size == 0 || child3.emptyChildAt(side);
  };
  ViewDesc.prototype.domAfterPos = function domAfterPos(pos) {
    var ref = this.domFromPos(pos, 0);
    var node4 = ref.node;
    var offset2 = ref.offset;
    if (node4.nodeType != 1 || offset2 == node4.childNodes.length) {
      throw new RangeError("No node after pos " + pos);
    }
    return node4.childNodes[offset2];
  };
  ViewDesc.prototype.setSelection = function setSelection(anchor, head, root, force) {
    var from4 = Math.min(anchor, head), to = Math.max(anchor, head);
    for (var i = 0, offset2 = 0; i < this.children.length; i++) {
      var child3 = this.children[i], end2 = offset2 + child3.size;
      if (from4 > offset2 && to < end2) {
        return child3.setSelection(anchor - offset2 - child3.border, head - offset2 - child3.border, root, force);
      }
      offset2 = end2;
    }
    var anchorDOM = this.domFromPos(anchor, anchor ? -1 : 1);
    var headDOM = head == anchor ? anchorDOM : this.domFromPos(head, head ? -1 : 1);
    var domSel = root.getSelection();
    var brKludge = false;
    if ((result.gecko || result.safari) && anchor == head) {
      var node4 = anchorDOM.node;
      var offset$1 = anchorDOM.offset;
      if (node4.nodeType == 3) {
        brKludge = offset$1 && node4.nodeValue[offset$1 - 1] == "\n";
        if (brKludge && offset$1 == node4.nodeValue.length) {
          for (var scan = node4, after2 = void 0; scan; scan = scan.parentNode) {
            if (after2 = scan.nextSibling) {
              if (after2.nodeName == "BR") {
                anchorDOM = headDOM = {node: after2.parentNode, offset: domIndex(after2) + 1};
              }
              break;
            }
            var desc = scan.pmViewDesc;
            if (desc && desc.node && desc.node.isBlock) {
              break;
            }
          }
        }
      } else {
        var prev = node4.childNodes[offset$1 - 1];
        brKludge = prev && (prev.nodeName == "BR" || prev.contentEditable == "false");
      }
    }
    if (result.gecko && domSel.focusNode && domSel.focusNode != headDOM.node && domSel.focusNode.nodeType == 1) {
      var after$1 = domSel.focusNode.childNodes[domSel.focusOffset];
      if (after$1 && after$1.contentEditable == "false") {
        force = true;
      }
    }
    if (!(force || brKludge && result.safari) && isEquivalentPosition(anchorDOM.node, anchorDOM.offset, domSel.anchorNode, domSel.anchorOffset) && isEquivalentPosition(headDOM.node, headDOM.offset, domSel.focusNode, domSel.focusOffset)) {
      return;
    }
    var domSelExtended = false;
    if ((domSel.extend || anchor == head) && !brKludge) {
      domSel.collapse(anchorDOM.node, anchorDOM.offset);
      try {
        if (anchor != head) {
          domSel.extend(headDOM.node, headDOM.offset);
        }
        domSelExtended = true;
      } catch (err2) {
        if (!(err2 instanceof DOMException)) {
          throw err2;
        }
      }
    }
    if (!domSelExtended) {
      if (anchor > head) {
        var tmp = anchorDOM;
        anchorDOM = headDOM;
        headDOM = tmp;
      }
      var range = document.createRange();
      range.setEnd(headDOM.node, headDOM.offset);
      range.setStart(anchorDOM.node, anchorDOM.offset);
      domSel.removeAllRanges();
      domSel.addRange(range);
    }
  };
  ViewDesc.prototype.ignoreMutation = function ignoreMutation(mutation) {
    return !this.contentDOM && mutation.type != "selection";
  };
  prototypeAccessors4.contentLost.get = function() {
    return this.contentDOM && this.contentDOM != this.dom && !this.dom.contains(this.contentDOM);
  };
  ViewDesc.prototype.markDirty = function markDirty(from4, to) {
    for (var offset2 = 0, i = 0; i < this.children.length; i++) {
      var child3 = this.children[i], end2 = offset2 + child3.size;
      if (offset2 == end2 ? from4 <= end2 && to >= offset2 : from4 < end2 && to > offset2) {
        var startInside = offset2 + child3.border, endInside = end2 - child3.border;
        if (from4 >= startInside && to <= endInside) {
          this.dirty = from4 == offset2 || to == end2 ? CONTENT_DIRTY : CHILD_DIRTY;
          if (from4 == startInside && to == endInside && (child3.contentLost || child3.dom.parentNode != this.contentDOM)) {
            child3.dirty = NODE_DIRTY;
          } else {
            child3.markDirty(from4 - startInside, to - startInside);
          }
          return;
        } else {
          child3.dirty = child3.dom == child3.contentDOM && child3.dom.parentNode == this.contentDOM ? CONTENT_DIRTY : NODE_DIRTY;
        }
      }
      offset2 = end2;
    }
    this.dirty = CONTENT_DIRTY;
  };
  ViewDesc.prototype.markParentsDirty = function markParentsDirty() {
    var level = 1;
    for (var node4 = this.parent; node4; node4 = node4.parent, level++) {
      var dirty = level == 1 ? CONTENT_DIRTY : CHILD_DIRTY;
      if (node4.dirty < dirty) {
        node4.dirty = dirty;
      }
    }
  };
  prototypeAccessors4.domAtom.get = function() {
    return false;
  };
  prototypeAccessors4.ignoreForCoords.get = function() {
    return false;
  };
  Object.defineProperties(ViewDesc.prototype, prototypeAccessors4);
  var nothing = [];
  var WidgetViewDesc = /* @__PURE__ */ function(ViewDesc3) {
    function WidgetViewDesc2(parent, widget2, view2, pos) {
      var self, dom = widget2.type.toDOM;
      if (typeof dom == "function") {
        dom = dom(view2, function() {
          if (!self) {
            return pos;
          }
          if (self.parent) {
            return self.parent.posBeforeChild(self);
          }
        });
      }
      if (!widget2.type.spec.raw) {
        if (dom.nodeType != 1) {
          var wrap = document.createElement("span");
          wrap.appendChild(dom);
          dom = wrap;
        }
        dom.contentEditable = false;
        dom.classList.add("ProseMirror-widget");
      }
      ViewDesc3.call(this, parent, nothing, dom, null);
      this.widget = widget2;
      self = this;
    }
    if (ViewDesc3)
      WidgetViewDesc2.__proto__ = ViewDesc3;
    WidgetViewDesc2.prototype = Object.create(ViewDesc3 && ViewDesc3.prototype);
    WidgetViewDesc2.prototype.constructor = WidgetViewDesc2;
    var prototypeAccessors$15 = {domAtom: {configurable: true}};
    WidgetViewDesc2.prototype.matchesWidget = function matchesWidget2(widget2) {
      return this.dirty == NOT_DIRTY && widget2.type.eq(this.widget.type);
    };
    WidgetViewDesc2.prototype.parseRule = function parseRule2() {
      return {ignore: true};
    };
    WidgetViewDesc2.prototype.stopEvent = function stopEvent2(event) {
      var stop2 = this.widget.spec.stopEvent;
      return stop2 ? stop2(event) : false;
    };
    WidgetViewDesc2.prototype.ignoreMutation = function ignoreMutation2(mutation) {
      return mutation.type != "selection" || this.widget.spec.ignoreSelection;
    };
    WidgetViewDesc2.prototype.destroy = function destroy4() {
      this.widget.type.destroy(this.dom);
      ViewDesc3.prototype.destroy.call(this);
    };
    prototypeAccessors$15.domAtom.get = function() {
      return true;
    };
    Object.defineProperties(WidgetViewDesc2.prototype, prototypeAccessors$15);
    return WidgetViewDesc2;
  }(ViewDesc);
  var CompositionViewDesc = /* @__PURE__ */ function(ViewDesc3) {
    function CompositionViewDesc2(parent, dom, textDOM, text2) {
      ViewDesc3.call(this, parent, nothing, dom, null);
      this.textDOM = textDOM;
      this.text = text2;
    }
    if (ViewDesc3)
      CompositionViewDesc2.__proto__ = ViewDesc3;
    CompositionViewDesc2.prototype = Object.create(ViewDesc3 && ViewDesc3.prototype);
    CompositionViewDesc2.prototype.constructor = CompositionViewDesc2;
    var prototypeAccessors$23 = {size: {configurable: true}};
    prototypeAccessors$23.size.get = function() {
      return this.text.length;
    };
    CompositionViewDesc2.prototype.localPosFromDOM = function localPosFromDOM2(dom, offset2) {
      if (dom != this.textDOM) {
        return this.posAtStart + (offset2 ? this.size : 0);
      }
      return this.posAtStart + offset2;
    };
    CompositionViewDesc2.prototype.domFromPos = function domFromPos2(pos) {
      return {node: this.textDOM, offset: pos};
    };
    CompositionViewDesc2.prototype.ignoreMutation = function ignoreMutation2(mut) {
      return mut.type === "characterData" && mut.target.nodeValue == mut.oldValue;
    };
    Object.defineProperties(CompositionViewDesc2.prototype, prototypeAccessors$23);
    return CompositionViewDesc2;
  }(ViewDesc);
  var MarkViewDesc = /* @__PURE__ */ function(ViewDesc3) {
    function MarkViewDesc2(parent, mark3, dom, contentDOM) {
      ViewDesc3.call(this, parent, [], dom, contentDOM);
      this.mark = mark3;
    }
    if (ViewDesc3)
      MarkViewDesc2.__proto__ = ViewDesc3;
    MarkViewDesc2.prototype = Object.create(ViewDesc3 && ViewDesc3.prototype);
    MarkViewDesc2.prototype.constructor = MarkViewDesc2;
    MarkViewDesc2.create = function create5(parent, mark3, inline2, view2) {
      var custom = view2.nodeViews[mark3.type.name];
      var spec = custom && custom(mark3, view2, inline2);
      if (!spec || !spec.dom) {
        spec = DOMSerializer.renderSpec(document, mark3.type.spec.toDOM(mark3, inline2));
      }
      return new MarkViewDesc2(parent, mark3, spec.dom, spec.contentDOM || spec.dom);
    };
    MarkViewDesc2.prototype.parseRule = function parseRule2() {
      return {mark: this.mark.type.name, attrs: this.mark.attrs, contentElement: this.contentDOM};
    };
    MarkViewDesc2.prototype.matchesMark = function matchesMark2(mark3) {
      return this.dirty != NODE_DIRTY && this.mark.eq(mark3);
    };
    MarkViewDesc2.prototype.markDirty = function markDirty2(from4, to) {
      ViewDesc3.prototype.markDirty.call(this, from4, to);
      if (this.dirty != NOT_DIRTY) {
        var parent = this.parent;
        while (!parent.node) {
          parent = parent.parent;
        }
        if (parent.dirty < this.dirty) {
          parent.dirty = this.dirty;
        }
        this.dirty = NOT_DIRTY;
      }
    };
    MarkViewDesc2.prototype.slice = function slice4(from4, to, view2) {
      var copy5 = MarkViewDesc2.create(this.parent, this.mark, true, view2);
      var nodes3 = this.children, size = this.size;
      if (to < size) {
        nodes3 = replaceNodes(nodes3, to, size, view2);
      }
      if (from4 > 0) {
        nodes3 = replaceNodes(nodes3, 0, from4, view2);
      }
      for (var i = 0; i < nodes3.length; i++) {
        nodes3[i].parent = copy5;
      }
      copy5.children = nodes3;
      return copy5;
    };
    return MarkViewDesc2;
  }(ViewDesc);
  var NodeViewDesc = /* @__PURE__ */ function(ViewDesc3) {
    function NodeViewDesc2(parent, node4, outerDeco, innerDeco, dom, contentDOM, nodeDOM2, view2, pos) {
      ViewDesc3.call(this, parent, node4.isLeaf ? nothing : [], dom, contentDOM);
      this.nodeDOM = nodeDOM2;
      this.node = node4;
      this.outerDeco = outerDeco;
      this.innerDeco = innerDeco;
      if (contentDOM) {
        this.updateChildren(view2, pos);
      }
    }
    if (ViewDesc3)
      NodeViewDesc2.__proto__ = ViewDesc3;
    NodeViewDesc2.prototype = Object.create(ViewDesc3 && ViewDesc3.prototype);
    NodeViewDesc2.prototype.constructor = NodeViewDesc2;
    var prototypeAccessors$32 = {size: {configurable: true}, border: {configurable: true}, domAtom: {configurable: true}};
    NodeViewDesc2.create = function create5(parent, node4, outerDeco, innerDeco, view2, pos) {
      var assign;
      var custom = view2.nodeViews[node4.type.name], descObj;
      var spec = custom && custom(node4, view2, function() {
        if (!descObj) {
          return pos;
        }
        if (descObj.parent) {
          return descObj.parent.posBeforeChild(descObj);
        }
      }, outerDeco, innerDeco);
      var dom = spec && spec.dom, contentDOM = spec && spec.contentDOM;
      if (node4.isText) {
        if (!dom) {
          dom = document.createTextNode(node4.text);
        } else if (dom.nodeType != 3) {
          throw new RangeError("Text must be rendered as a DOM text node");
        }
      } else if (!dom) {
        assign = DOMSerializer.renderSpec(document, node4.type.spec.toDOM(node4)), dom = assign.dom, contentDOM = assign.contentDOM;
      }
      if (!contentDOM && !node4.isText && dom.nodeName != "BR") {
        if (!dom.hasAttribute("contenteditable")) {
          dom.contentEditable = false;
        }
        if (node4.type.spec.draggable) {
          dom.draggable = true;
        }
      }
      var nodeDOM2 = dom;
      dom = applyOuterDeco(dom, outerDeco, node4);
      if (spec) {
        return descObj = new CustomNodeViewDesc(parent, node4, outerDeco, innerDeco, dom, contentDOM, nodeDOM2, spec, view2, pos + 1);
      } else if (node4.isText) {
        return new TextViewDesc(parent, node4, outerDeco, innerDeco, dom, nodeDOM2, view2);
      } else {
        return new NodeViewDesc2(parent, node4, outerDeco, innerDeco, dom, contentDOM, nodeDOM2, view2, pos + 1);
      }
    };
    NodeViewDesc2.prototype.parseRule = function parseRule2() {
      var this$1 = this;
      if (this.node.type.spec.reparseInView) {
        return null;
      }
      var rule = {node: this.node.type.name, attrs: this.node.attrs};
      if (this.node.type.spec.code) {
        rule.preserveWhitespace = "full";
      }
      if (this.contentDOM && !this.contentLost) {
        rule.contentElement = this.contentDOM;
      } else {
        rule.getContent = function() {
          return this$1.contentDOM ? Fragment.empty : this$1.node.content;
        };
      }
      return rule;
    };
    NodeViewDesc2.prototype.matchesNode = function matchesNode2(node4, outerDeco, innerDeco) {
      return this.dirty == NOT_DIRTY && node4.eq(this.node) && sameOuterDeco(outerDeco, this.outerDeco) && innerDeco.eq(this.innerDeco);
    };
    prototypeAccessors$32.size.get = function() {
      return this.node.nodeSize;
    };
    prototypeAccessors$32.border.get = function() {
      return this.node.isLeaf ? 0 : 1;
    };
    NodeViewDesc2.prototype.updateChildren = function updateChildren(view2, pos) {
      var this$1 = this;
      var inline2 = this.node.inlineContent, off = pos;
      var composition = view2.composing && this.localCompositionInfo(view2, pos);
      var localComposition = composition && composition.pos > -1 ? composition : null;
      var compositionInChild = composition && composition.pos < 0;
      var updater = new ViewTreeUpdater(this, localComposition && localComposition.node);
      iterDeco(this.node, this.innerDeco, function(widget2, i, insideNode) {
        if (widget2.spec.marks) {
          updater.syncToMarks(widget2.spec.marks, inline2, view2);
        } else if (widget2.type.side >= 0 && !insideNode) {
          updater.syncToMarks(i == this$1.node.childCount ? Mark.none : this$1.node.child(i).marks, inline2, view2);
        }
        updater.placeWidget(widget2, view2, off);
      }, function(child3, outerDeco, innerDeco, i) {
        updater.syncToMarks(child3.marks, inline2, view2);
        var compIndex;
        if (updater.findNodeMatch(child3, outerDeco, innerDeco, i))
          ;
        else if (compositionInChild && view2.state.selection.from > off && view2.state.selection.to < off + child3.nodeSize && (compIndex = updater.findIndexWithChild(composition.node)) > -1 && updater.updateNodeAt(child3, outerDeco, innerDeco, compIndex, view2))
          ;
        else if (updater.updateNextNode(child3, outerDeco, innerDeco, view2, i))
          ;
        else {
          updater.addNode(child3, outerDeco, innerDeco, view2, off);
        }
        off += child3.nodeSize;
      });
      updater.syncToMarks(nothing, inline2, view2);
      if (this.node.isTextblock) {
        updater.addTextblockHacks();
      }
      updater.destroyRest();
      if (updater.changed || this.dirty == CONTENT_DIRTY) {
        if (localComposition) {
          this.protectLocalComposition(view2, localComposition);
        }
        renderDescs(this.contentDOM, this.children, view2);
        if (result.ios) {
          iosHacks(this.dom);
        }
      }
    };
    NodeViewDesc2.prototype.localCompositionInfo = function localCompositionInfo(view2, pos) {
      var ref = view2.state.selection;
      var from4 = ref.from;
      var to = ref.to;
      if (!(view2.state.selection instanceof TextSelection) || from4 < pos || to > pos + this.node.content.size) {
        return;
      }
      var sel = view2.root.getSelection();
      var textNode = nearbyTextNode(sel.focusNode, sel.focusOffset);
      if (!textNode || !this.dom.contains(textNode.parentNode)) {
        return;
      }
      if (this.node.inlineContent) {
        var text2 = textNode.nodeValue;
        var textPos = findTextInFragment(this.node.content, text2, from4 - pos, to - pos);
        return textPos < 0 ? null : {node: textNode, pos: textPos, text: text2};
      } else {
        return {node: textNode, pos: -1};
      }
    };
    NodeViewDesc2.prototype.protectLocalComposition = function protectLocalComposition(view2, ref) {
      var node4 = ref.node;
      var pos = ref.pos;
      var text2 = ref.text;
      if (this.getDesc(node4)) {
        return;
      }
      var topNode = node4;
      for (; ; topNode = topNode.parentNode) {
        if (topNode.parentNode == this.contentDOM) {
          break;
        }
        while (topNode.previousSibling) {
          topNode.parentNode.removeChild(topNode.previousSibling);
        }
        while (topNode.nextSibling) {
          topNode.parentNode.removeChild(topNode.nextSibling);
        }
        if (topNode.pmViewDesc) {
          topNode.pmViewDesc = null;
        }
      }
      var desc = new CompositionViewDesc(this, topNode, node4, text2);
      view2.compositionNodes.push(desc);
      this.children = replaceNodes(this.children, pos, pos + text2.length, view2, desc);
    };
    NodeViewDesc2.prototype.update = function update2(node4, outerDeco, innerDeco, view2) {
      if (this.dirty == NODE_DIRTY || !node4.sameMarkup(this.node)) {
        return false;
      }
      this.updateInner(node4, outerDeco, innerDeco, view2);
      return true;
    };
    NodeViewDesc2.prototype.updateInner = function updateInner(node4, outerDeco, innerDeco, view2) {
      this.updateOuterDeco(outerDeco);
      this.node = node4;
      this.innerDeco = innerDeco;
      if (this.contentDOM) {
        this.updateChildren(view2, this.posAtStart);
      }
      this.dirty = NOT_DIRTY;
    };
    NodeViewDesc2.prototype.updateOuterDeco = function updateOuterDeco(outerDeco) {
      if (sameOuterDeco(outerDeco, this.outerDeco)) {
        return;
      }
      var needsWrap = this.nodeDOM.nodeType != 1;
      var oldDOM = this.dom;
      this.dom = patchOuterDeco(this.dom, this.nodeDOM, computeOuterDeco(this.outerDeco, this.node, needsWrap), computeOuterDeco(outerDeco, this.node, needsWrap));
      if (this.dom != oldDOM) {
        oldDOM.pmViewDesc = null;
        this.dom.pmViewDesc = this;
      }
      this.outerDeco = outerDeco;
    };
    NodeViewDesc2.prototype.selectNode = function selectNode() {
      this.nodeDOM.classList.add("ProseMirror-selectednode");
      if (this.contentDOM || !this.node.type.spec.draggable) {
        this.dom.draggable = true;
      }
    };
    NodeViewDesc2.prototype.deselectNode = function deselectNode() {
      this.nodeDOM.classList.remove("ProseMirror-selectednode");
      if (this.contentDOM || !this.node.type.spec.draggable) {
        this.dom.removeAttribute("draggable");
      }
    };
    prototypeAccessors$32.domAtom.get = function() {
      return this.node.isAtom;
    };
    Object.defineProperties(NodeViewDesc2.prototype, prototypeAccessors$32);
    return NodeViewDesc2;
  }(ViewDesc);
  function docViewDesc(doc2, outerDeco, innerDeco, dom, view2) {
    applyOuterDeco(dom, outerDeco, doc2);
    return new NodeViewDesc(null, doc2, outerDeco, innerDeco, dom, dom, dom, view2, 0);
  }
  var TextViewDesc = /* @__PURE__ */ function(NodeViewDesc2) {
    function TextViewDesc2(parent, node4, outerDeco, innerDeco, dom, nodeDOM2, view2) {
      NodeViewDesc2.call(this, parent, node4, outerDeco, innerDeco, dom, null, nodeDOM2, view2);
    }
    if (NodeViewDesc2)
      TextViewDesc2.__proto__ = NodeViewDesc2;
    TextViewDesc2.prototype = Object.create(NodeViewDesc2 && NodeViewDesc2.prototype);
    TextViewDesc2.prototype.constructor = TextViewDesc2;
    var prototypeAccessors$42 = {domAtom: {configurable: true}};
    TextViewDesc2.prototype.parseRule = function parseRule2() {
      var skip = this.nodeDOM.parentNode;
      while (skip && skip != this.dom && !skip.pmIsDeco) {
        skip = skip.parentNode;
      }
      return {skip: skip || true};
    };
    TextViewDesc2.prototype.update = function update2(node4, outerDeco, _, view2) {
      if (this.dirty == NODE_DIRTY || this.dirty != NOT_DIRTY && !this.inParent() || !node4.sameMarkup(this.node)) {
        return false;
      }
      this.updateOuterDeco(outerDeco);
      if ((this.dirty != NOT_DIRTY || node4.text != this.node.text) && node4.text != this.nodeDOM.nodeValue) {
        this.nodeDOM.nodeValue = node4.text;
        if (view2.trackWrites == this.nodeDOM) {
          view2.trackWrites = null;
        }
      }
      this.node = node4;
      this.dirty = NOT_DIRTY;
      return true;
    };
    TextViewDesc2.prototype.inParent = function inParent() {
      var parentDOM = this.parent.contentDOM;
      for (var n = this.nodeDOM; n; n = n.parentNode) {
        if (n == parentDOM) {
          return true;
        }
      }
      return false;
    };
    TextViewDesc2.prototype.domFromPos = function domFromPos2(pos) {
      return {node: this.nodeDOM, offset: pos};
    };
    TextViewDesc2.prototype.localPosFromDOM = function localPosFromDOM2(dom, offset2, bias) {
      if (dom == this.nodeDOM) {
        return this.posAtStart + Math.min(offset2, this.node.text.length);
      }
      return NodeViewDesc2.prototype.localPosFromDOM.call(this, dom, offset2, bias);
    };
    TextViewDesc2.prototype.ignoreMutation = function ignoreMutation2(mutation) {
      return mutation.type != "characterData" && mutation.type != "selection";
    };
    TextViewDesc2.prototype.slice = function slice4(from4, to, view2) {
      var node4 = this.node.cut(from4, to), dom = document.createTextNode(node4.text);
      return new TextViewDesc2(this.parent, node4, this.outerDeco, this.innerDeco, dom, dom, view2);
    };
    TextViewDesc2.prototype.markDirty = function markDirty2(from4, to) {
      NodeViewDesc2.prototype.markDirty.call(this, from4, to);
      if (this.dom != this.nodeDOM && (from4 == 0 || to == this.nodeDOM.nodeValue.length)) {
        this.dirty = NODE_DIRTY;
      }
    };
    prototypeAccessors$42.domAtom.get = function() {
      return false;
    };
    Object.defineProperties(TextViewDesc2.prototype, prototypeAccessors$42);
    return TextViewDesc2;
  }(NodeViewDesc);
  var TrailingHackViewDesc = /* @__PURE__ */ function(ViewDesc3) {
    function TrailingHackViewDesc2() {
      ViewDesc3.apply(this, arguments);
    }
    if (ViewDesc3)
      TrailingHackViewDesc2.__proto__ = ViewDesc3;
    TrailingHackViewDesc2.prototype = Object.create(ViewDesc3 && ViewDesc3.prototype);
    TrailingHackViewDesc2.prototype.constructor = TrailingHackViewDesc2;
    var prototypeAccessors$52 = {domAtom: {configurable: true}, ignoreForCoords: {configurable: true}};
    TrailingHackViewDesc2.prototype.parseRule = function parseRule2() {
      return {ignore: true};
    };
    TrailingHackViewDesc2.prototype.matchesHack = function matchesHack2(nodeName) {
      return this.dirty == NOT_DIRTY && this.dom.nodeName == nodeName;
    };
    prototypeAccessors$52.domAtom.get = function() {
      return true;
    };
    prototypeAccessors$52.ignoreForCoords.get = function() {
      return this.dom.nodeName == "IMG";
    };
    Object.defineProperties(TrailingHackViewDesc2.prototype, prototypeAccessors$52);
    return TrailingHackViewDesc2;
  }(ViewDesc);
  var CustomNodeViewDesc = /* @__PURE__ */ function(NodeViewDesc2) {
    function CustomNodeViewDesc2(parent, node4, outerDeco, innerDeco, dom, contentDOM, nodeDOM2, spec, view2, pos) {
      NodeViewDesc2.call(this, parent, node4, outerDeco, innerDeco, dom, contentDOM, nodeDOM2, view2, pos);
      this.spec = spec;
    }
    if (NodeViewDesc2)
      CustomNodeViewDesc2.__proto__ = NodeViewDesc2;
    CustomNodeViewDesc2.prototype = Object.create(NodeViewDesc2 && NodeViewDesc2.prototype);
    CustomNodeViewDesc2.prototype.constructor = CustomNodeViewDesc2;
    CustomNodeViewDesc2.prototype.update = function update2(node4, outerDeco, innerDeco, view2) {
      if (this.dirty == NODE_DIRTY) {
        return false;
      }
      if (this.spec.update) {
        var result2 = this.spec.update(node4, outerDeco, innerDeco);
        if (result2) {
          this.updateInner(node4, outerDeco, innerDeco, view2);
        }
        return result2;
      } else if (!this.contentDOM && !node4.isLeaf) {
        return false;
      } else {
        return NodeViewDesc2.prototype.update.call(this, node4, outerDeco, innerDeco, view2);
      }
    };
    CustomNodeViewDesc2.prototype.selectNode = function selectNode() {
      this.spec.selectNode ? this.spec.selectNode() : NodeViewDesc2.prototype.selectNode.call(this);
    };
    CustomNodeViewDesc2.prototype.deselectNode = function deselectNode() {
      this.spec.deselectNode ? this.spec.deselectNode() : NodeViewDesc2.prototype.deselectNode.call(this);
    };
    CustomNodeViewDesc2.prototype.setSelection = function setSelection2(anchor, head, root, force) {
      this.spec.setSelection ? this.spec.setSelection(anchor, head, root) : NodeViewDesc2.prototype.setSelection.call(this, anchor, head, root, force);
    };
    CustomNodeViewDesc2.prototype.destroy = function destroy4() {
      if (this.spec.destroy) {
        this.spec.destroy();
      }
      NodeViewDesc2.prototype.destroy.call(this);
    };
    CustomNodeViewDesc2.prototype.stopEvent = function stopEvent2(event) {
      return this.spec.stopEvent ? this.spec.stopEvent(event) : false;
    };
    CustomNodeViewDesc2.prototype.ignoreMutation = function ignoreMutation2(mutation) {
      return this.spec.ignoreMutation ? this.spec.ignoreMutation(mutation) : NodeViewDesc2.prototype.ignoreMutation.call(this, mutation);
    };
    return CustomNodeViewDesc2;
  }(NodeViewDesc);
  function renderDescs(parentDOM, descs, view2) {
    var dom = parentDOM.firstChild, written = false;
    for (var i = 0; i < descs.length; i++) {
      var desc = descs[i], childDOM = desc.dom;
      if (childDOM.parentNode == parentDOM) {
        while (childDOM != dom) {
          dom = rm(dom);
          written = true;
        }
        dom = dom.nextSibling;
      } else {
        written = true;
        parentDOM.insertBefore(childDOM, dom);
      }
      if (desc instanceof MarkViewDesc) {
        var pos = dom ? dom.previousSibling : parentDOM.lastChild;
        renderDescs(desc.contentDOM, desc.children, view2);
        dom = pos ? pos.nextSibling : parentDOM.firstChild;
      }
    }
    while (dom) {
      dom = rm(dom);
      written = true;
    }
    if (written && view2.trackWrites == parentDOM) {
      view2.trackWrites = null;
    }
  }
  function OuterDecoLevel(nodeName) {
    if (nodeName) {
      this.nodeName = nodeName;
    }
  }
  OuterDecoLevel.prototype = Object.create(null);
  var noDeco = [new OuterDecoLevel()];
  function computeOuterDeco(outerDeco, node4, needsWrap) {
    if (outerDeco.length == 0) {
      return noDeco;
    }
    var top = needsWrap ? noDeco[0] : new OuterDecoLevel(), result2 = [top];
    for (var i = 0; i < outerDeco.length; i++) {
      var attrs = outerDeco[i].type.attrs;
      if (!attrs) {
        continue;
      }
      if (attrs.nodeName) {
        result2.push(top = new OuterDecoLevel(attrs.nodeName));
      }
      for (var name in attrs) {
        var val = attrs[name];
        if (val == null) {
          continue;
        }
        if (needsWrap && result2.length == 1) {
          result2.push(top = new OuterDecoLevel(node4.isInline ? "span" : "div"));
        }
        if (name == "class") {
          top.class = (top.class ? top.class + " " : "") + val;
        } else if (name == "style") {
          top.style = (top.style ? top.style + ";" : "") + val;
        } else if (name != "nodeName") {
          top[name] = val;
        }
      }
    }
    return result2;
  }
  function patchOuterDeco(outerDOM, nodeDOM2, prevComputed, curComputed) {
    if (prevComputed == noDeco && curComputed == noDeco) {
      return nodeDOM2;
    }
    var curDOM = nodeDOM2;
    for (var i = 0; i < curComputed.length; i++) {
      var deco = curComputed[i], prev = prevComputed[i];
      if (i) {
        var parent = void 0;
        if (prev && prev.nodeName == deco.nodeName && curDOM != outerDOM && (parent = curDOM.parentNode) && parent.tagName.toLowerCase() == deco.nodeName) {
          curDOM = parent;
        } else {
          parent = document.createElement(deco.nodeName);
          parent.pmIsDeco = true;
          parent.appendChild(curDOM);
          prev = noDeco[0];
          curDOM = parent;
        }
      }
      patchAttributes(curDOM, prev || noDeco[0], deco);
    }
    return curDOM;
  }
  function patchAttributes(dom, prev, cur) {
    for (var name in prev) {
      if (name != "class" && name != "style" && name != "nodeName" && !(name in cur)) {
        dom.removeAttribute(name);
      }
    }
    for (var name$1 in cur) {
      if (name$1 != "class" && name$1 != "style" && name$1 != "nodeName" && cur[name$1] != prev[name$1]) {
        dom.setAttribute(name$1, cur[name$1]);
      }
    }
    if (prev.class != cur.class) {
      var prevList = prev.class ? prev.class.split(" ").filter(Boolean) : nothing;
      var curList = cur.class ? cur.class.split(" ").filter(Boolean) : nothing;
      for (var i = 0; i < prevList.length; i++) {
        if (curList.indexOf(prevList[i]) == -1) {
          dom.classList.remove(prevList[i]);
        }
      }
      for (var i$1 = 0; i$1 < curList.length; i$1++) {
        if (prevList.indexOf(curList[i$1]) == -1) {
          dom.classList.add(curList[i$1]);
        }
      }
      if (dom.classList.length == 0) {
        dom.removeAttribute("class");
      }
    }
    if (prev.style != cur.style) {
      if (prev.style) {
        var prop = /\s*([\w\-\xa1-\uffff]+)\s*:(?:"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\(.*?\)|[^;])*/g, m;
        while (m = prop.exec(prev.style)) {
          dom.style.removeProperty(m[1]);
        }
      }
      if (cur.style) {
        dom.style.cssText += cur.style;
      }
    }
  }
  function applyOuterDeco(dom, deco, node4) {
    return patchOuterDeco(dom, dom, noDeco, computeOuterDeco(deco, node4, dom.nodeType != 1));
  }
  function sameOuterDeco(a, b) {
    if (a.length != b.length) {
      return false;
    }
    for (var i = 0; i < a.length; i++) {
      if (!a[i].type.eq(b[i].type)) {
        return false;
      }
    }
    return true;
  }
  function rm(dom) {
    var next = dom.nextSibling;
    dom.parentNode.removeChild(dom);
    return next;
  }
  var ViewTreeUpdater = function ViewTreeUpdater2(top, lockedNode) {
    this.top = top;
    this.lock = lockedNode;
    this.index = 0;
    this.stack = [];
    this.changed = false;
    this.preMatch = preMatch(top.node.content, top);
  };
  ViewTreeUpdater.prototype.destroyBetween = function destroyBetween(start3, end2) {
    if (start3 == end2) {
      return;
    }
    for (var i = start3; i < end2; i++) {
      this.top.children[i].destroy();
    }
    this.top.children.splice(start3, end2 - start3);
    this.changed = true;
  };
  ViewTreeUpdater.prototype.destroyRest = function destroyRest() {
    this.destroyBetween(this.index, this.top.children.length);
  };
  ViewTreeUpdater.prototype.syncToMarks = function syncToMarks(marks4, inline2, view2) {
    var keep = 0, depth = this.stack.length >> 1;
    var maxKeep = Math.min(depth, marks4.length);
    while (keep < maxKeep && (keep == depth - 1 ? this.top : this.stack[keep + 1 << 1]).matchesMark(marks4[keep]) && marks4[keep].type.spec.spanning !== false) {
      keep++;
    }
    while (keep < depth) {
      this.destroyRest();
      this.top.dirty = NOT_DIRTY;
      this.index = this.stack.pop();
      this.top = this.stack.pop();
      depth--;
    }
    while (depth < marks4.length) {
      this.stack.push(this.top, this.index + 1);
      var found2 = -1;
      for (var i = this.index; i < Math.min(this.index + 3, this.top.children.length); i++) {
        if (this.top.children[i].matchesMark(marks4[depth])) {
          found2 = i;
          break;
        }
      }
      if (found2 > -1) {
        if (found2 > this.index) {
          this.changed = true;
          this.destroyBetween(this.index, found2);
        }
        this.top = this.top.children[this.index];
      } else {
        var markDesc = MarkViewDesc.create(this.top, marks4[depth], inline2, view2);
        this.top.children.splice(this.index, 0, markDesc);
        this.top = markDesc;
        this.changed = true;
      }
      this.index = 0;
      depth++;
    }
  };
  ViewTreeUpdater.prototype.findNodeMatch = function findNodeMatch(node4, outerDeco, innerDeco, index2) {
    var found2 = -1, targetDesc;
    if (index2 >= this.preMatch.index && (targetDesc = this.preMatch.matches[index2 - this.preMatch.index]).parent == this.top && targetDesc.matchesNode(node4, outerDeco, innerDeco)) {
      found2 = this.top.children.indexOf(targetDesc, this.index);
    } else {
      for (var i = this.index, e = Math.min(this.top.children.length, i + 5); i < e; i++) {
        var child3 = this.top.children[i];
        if (child3.matchesNode(node4, outerDeco, innerDeco) && !this.preMatch.matched.has(child3)) {
          found2 = i;
          break;
        }
      }
    }
    if (found2 < 0) {
      return false;
    }
    this.destroyBetween(this.index, found2);
    this.index++;
    return true;
  };
  ViewTreeUpdater.prototype.updateNodeAt = function updateNodeAt(node4, outerDeco, innerDeco, index2, view2) {
    var child3 = this.top.children[index2];
    if (!child3.update(node4, outerDeco, innerDeco, view2)) {
      return false;
    }
    this.destroyBetween(this.index, index2);
    this.index = index2 + 1;
    return true;
  };
  ViewTreeUpdater.prototype.findIndexWithChild = function findIndexWithChild(domNode) {
    for (; ; ) {
      var parent = domNode.parentNode;
      if (!parent) {
        return -1;
      }
      if (parent == this.top.contentDOM) {
        var desc = domNode.pmViewDesc;
        if (desc) {
          for (var i = this.index; i < this.top.children.length; i++) {
            if (this.top.children[i] == desc) {
              return i;
            }
          }
        }
        return -1;
      }
      domNode = parent;
    }
  };
  ViewTreeUpdater.prototype.updateNextNode = function updateNextNode(node4, outerDeco, innerDeco, view2, index2) {
    for (var i = this.index; i < this.top.children.length; i++) {
      var next = this.top.children[i];
      if (next instanceof NodeViewDesc) {
        var preMatch2 = this.preMatch.matched.get(next);
        if (preMatch2 != null && preMatch2 != index2) {
          return false;
        }
        var nextDOM = next.dom;
        var locked = this.lock && (nextDOM == this.lock || nextDOM.nodeType == 1 && nextDOM.contains(this.lock.parentNode)) && !(node4.isText && next.node && next.node.isText && next.nodeDOM.nodeValue == node4.text && next.dirty != NODE_DIRTY && sameOuterDeco(outerDeco, next.outerDeco));
        if (!locked && next.update(node4, outerDeco, innerDeco, view2)) {
          this.destroyBetween(this.index, i);
          if (next.dom != nextDOM) {
            this.changed = true;
          }
          this.index++;
          return true;
        }
        break;
      }
    }
    return false;
  };
  ViewTreeUpdater.prototype.addNode = function addNode2(node4, outerDeco, innerDeco, view2, pos) {
    this.top.children.splice(this.index++, 0, NodeViewDesc.create(this.top, node4, outerDeco, innerDeco, view2, pos));
    this.changed = true;
  };
  ViewTreeUpdater.prototype.placeWidget = function placeWidget(widget2, view2, pos) {
    var next = this.index < this.top.children.length ? this.top.children[this.index] : null;
    if (next && next.matchesWidget(widget2) && (widget2 == next.widget || !next.widget.type.toDOM.parentNode)) {
      this.index++;
    } else {
      var desc = new WidgetViewDesc(this.top, widget2, view2, pos);
      this.top.children.splice(this.index++, 0, desc);
      this.changed = true;
    }
  };
  ViewTreeUpdater.prototype.addTextblockHacks = function addTextblockHacks() {
    var lastChild = this.top.children[this.index - 1];
    while (lastChild instanceof MarkViewDesc) {
      lastChild = lastChild.children[lastChild.children.length - 1];
    }
    if (!lastChild || !(lastChild instanceof TextViewDesc) || /\n$/.test(lastChild.node.text)) {
      if ((result.safari || result.chrome) && lastChild && lastChild.dom.contentEditable == "false") {
        this.addHackNode("IMG");
      }
      this.addHackNode("BR");
    }
  };
  ViewTreeUpdater.prototype.addHackNode = function addHackNode(nodeName) {
    if (this.index < this.top.children.length && this.top.children[this.index].matchesHack(nodeName)) {
      this.index++;
    } else {
      var dom = document.createElement(nodeName);
      if (nodeName == "IMG") {
        dom.className = "ProseMirror-separator";
      }
      if (nodeName == "BR") {
        dom.className = "ProseMirror-trailingBreak";
      }
      this.top.children.splice(this.index++, 0, new TrailingHackViewDesc(this.top, nothing, dom, null));
      this.changed = true;
    }
  };
  function preMatch(frag, parentDesc) {
    var curDesc = parentDesc, descI = curDesc.children.length;
    var fI = frag.childCount, matched = new Map(), matches2 = [];
    outer:
      while (fI > 0) {
        var desc = void 0;
        for (; ; ) {
          if (descI) {
            var next = curDesc.children[descI - 1];
            if (next instanceof MarkViewDesc) {
              curDesc = next;
              descI = next.children.length;
            } else {
              desc = next;
              descI--;
              break;
            }
          } else if (curDesc == parentDesc) {
            break outer;
          } else {
            descI = curDesc.parent.children.indexOf(curDesc);
            curDesc = curDesc.parent;
          }
        }
        var node4 = desc.node;
        if (!node4) {
          continue;
        }
        if (node4 != frag.child(fI - 1)) {
          break;
        }
        --fI;
        matched.set(desc, fI);
        matches2.push(desc);
      }
    return {index: fI, matched, matches: matches2.reverse()};
  }
  function compareSide(a, b) {
    return a.type.side - b.type.side;
  }
  function iterDeco(parent, deco, onWidget, onNode) {
    var locals3 = deco.locals(parent), offset2 = 0;
    if (locals3.length == 0) {
      for (var i = 0; i < parent.childCount; i++) {
        var child3 = parent.child(i);
        onNode(child3, locals3, deco.forChild(offset2, child3), i);
        offset2 += child3.nodeSize;
      }
      return;
    }
    var decoIndex = 0, active = [], restNode = null;
    for (var parentIndex = 0; ; ) {
      if (decoIndex < locals3.length && locals3[decoIndex].to == offset2) {
        var widget2 = locals3[decoIndex++], widgets = void 0;
        while (decoIndex < locals3.length && locals3[decoIndex].to == offset2) {
          (widgets || (widgets = [widget2])).push(locals3[decoIndex++]);
        }
        if (widgets) {
          widgets.sort(compareSide);
          for (var i$1 = 0; i$1 < widgets.length; i$1++) {
            onWidget(widgets[i$1], parentIndex, !!restNode);
          }
        } else {
          onWidget(widget2, parentIndex, !!restNode);
        }
      }
      var child$1 = void 0, index2 = void 0;
      if (restNode) {
        index2 = -1;
        child$1 = restNode;
        restNode = null;
      } else if (parentIndex < parent.childCount) {
        index2 = parentIndex;
        child$1 = parent.child(parentIndex++);
      } else {
        break;
      }
      for (var i$2 = 0; i$2 < active.length; i$2++) {
        if (active[i$2].to <= offset2) {
          active.splice(i$2--, 1);
        }
      }
      while (decoIndex < locals3.length && locals3[decoIndex].from <= offset2 && locals3[decoIndex].to > offset2) {
        active.push(locals3[decoIndex++]);
      }
      var end2 = offset2 + child$1.nodeSize;
      if (child$1.isText) {
        var cutAt = end2;
        if (decoIndex < locals3.length && locals3[decoIndex].from < cutAt) {
          cutAt = locals3[decoIndex].from;
        }
        for (var i$3 = 0; i$3 < active.length; i$3++) {
          if (active[i$3].to < cutAt) {
            cutAt = active[i$3].to;
          }
        }
        if (cutAt < end2) {
          restNode = child$1.cut(cutAt - offset2);
          child$1 = child$1.cut(0, cutAt - offset2);
          end2 = cutAt;
          index2 = -1;
        }
      }
      var outerDeco = !active.length ? nothing : child$1.isInline && !child$1.isLeaf ? active.filter(function(d) {
        return !d.inline;
      }) : active.slice();
      onNode(child$1, outerDeco, deco.forChild(offset2, child$1), index2);
      offset2 = end2;
    }
  }
  function iosHacks(dom) {
    if (dom.nodeName == "UL" || dom.nodeName == "OL") {
      var oldCSS = dom.style.cssText;
      dom.style.cssText = oldCSS + "; list-style: square !important";
      window.getComputedStyle(dom).listStyle;
      dom.style.cssText = oldCSS;
    }
  }
  function nearbyTextNode(node4, offset2) {
    for (; ; ) {
      if (node4.nodeType == 3) {
        return node4;
      }
      if (node4.nodeType == 1 && offset2 > 0) {
        if (node4.childNodes.length > offset2 && node4.childNodes[offset2].nodeType == 3) {
          return node4.childNodes[offset2];
        }
        node4 = node4.childNodes[offset2 - 1];
        offset2 = nodeSize(node4);
      } else if (node4.nodeType == 1 && offset2 < node4.childNodes.length) {
        node4 = node4.childNodes[offset2];
        offset2 = 0;
      } else {
        return null;
      }
    }
  }
  function findTextInFragment(frag, text2, from4, to) {
    for (var i = 0, pos = 0; i < frag.childCount && pos <= to; ) {
      var child3 = frag.child(i++), childStart = pos;
      pos += child3.nodeSize;
      if (!child3.isText) {
        continue;
      }
      var str = child3.text;
      while (i < frag.childCount) {
        var next = frag.child(i++);
        pos += next.nodeSize;
        if (!next.isText) {
          break;
        }
        str += next.text;
      }
      if (pos >= from4) {
        var found2 = str.lastIndexOf(text2, to - childStart);
        if (found2 >= 0 && found2 + text2.length + childStart >= from4) {
          return childStart + found2;
        }
      }
    }
    return -1;
  }
  function replaceNodes(nodes3, from4, to, view2, replacement) {
    var result2 = [];
    for (var i = 0, off = 0; i < nodes3.length; i++) {
      var child3 = nodes3[i], start3 = off, end2 = off += child3.size;
      if (start3 >= to || end2 <= from4) {
        result2.push(child3);
      } else {
        if (start3 < from4) {
          result2.push(child3.slice(0, from4 - start3, view2));
        }
        if (replacement) {
          result2.push(replacement);
          replacement = null;
        }
        if (end2 > to) {
          result2.push(child3.slice(to - start3, child3.size, view2));
        }
      }
    }
    return result2;
  }
  function selectionFromDOM(view2, origin) {
    var domSel = view2.root.getSelection(), doc2 = view2.state.doc;
    if (!domSel.focusNode) {
      return null;
    }
    var nearestDesc2 = view2.docView.nearestDesc(domSel.focusNode), inWidget = nearestDesc2 && nearestDesc2.size == 0;
    var head = view2.docView.posFromDOM(domSel.focusNode, domSel.focusOffset);
    if (head < 0) {
      return null;
    }
    var $head = doc2.resolve(head), $anchor, selection;
    if (selectionCollapsed(domSel)) {
      $anchor = $head;
      while (nearestDesc2 && !nearestDesc2.node) {
        nearestDesc2 = nearestDesc2.parent;
      }
      if (nearestDesc2 && nearestDesc2.node.isAtom && NodeSelection.isSelectable(nearestDesc2.node) && nearestDesc2.parent && !(nearestDesc2.node.isInline && isOnEdge(domSel.focusNode, domSel.focusOffset, nearestDesc2.dom))) {
        var pos = nearestDesc2.posBefore;
        selection = new NodeSelection(head == pos ? $head : doc2.resolve(pos));
      }
    } else {
      var anchor = view2.docView.posFromDOM(domSel.anchorNode, domSel.anchorOffset);
      if (anchor < 0) {
        return null;
      }
      $anchor = doc2.resolve(anchor);
    }
    if (!selection) {
      var bias = origin == "pointer" || view2.state.selection.head < $head.pos && !inWidget ? 1 : -1;
      selection = selectionBetween(view2, $anchor, $head, bias);
    }
    return selection;
  }
  function editorOwnsSelection(view2) {
    return view2.editable ? view2.hasFocus() : hasSelection(view2) && document.activeElement && document.activeElement.contains(view2.dom);
  }
  function selectionToDOM(view2, force) {
    var sel = view2.state.selection;
    syncNodeSelection(view2, sel);
    if (!editorOwnsSelection(view2)) {
      return;
    }
    if (!force && view2.mouseDown && view2.mouseDown.allowDefault) {
      view2.mouseDown.delayedSelectionSync = true;
      view2.domObserver.setCurSelection();
      return;
    }
    view2.domObserver.disconnectSelection();
    if (view2.cursorWrapper) {
      selectCursorWrapper(view2);
    } else {
      var anchor = sel.anchor;
      var head = sel.head;
      var resetEditableFrom, resetEditableTo;
      if (brokenSelectBetweenUneditable && !(sel instanceof TextSelection)) {
        if (!sel.$from.parent.inlineContent) {
          resetEditableFrom = temporarilyEditableNear(view2, sel.from);
        }
        if (!sel.empty && !sel.$from.parent.inlineContent) {
          resetEditableTo = temporarilyEditableNear(view2, sel.to);
        }
      }
      view2.docView.setSelection(anchor, head, view2.root, force);
      if (brokenSelectBetweenUneditable) {
        if (resetEditableFrom) {
          resetEditable(resetEditableFrom);
        }
        if (resetEditableTo) {
          resetEditable(resetEditableTo);
        }
      }
      if (sel.visible) {
        view2.dom.classList.remove("ProseMirror-hideselection");
      } else {
        view2.dom.classList.add("ProseMirror-hideselection");
        if ("onselectionchange" in document) {
          removeClassOnSelectionChange(view2);
        }
      }
    }
    view2.domObserver.setCurSelection();
    view2.domObserver.connectSelection();
  }
  var brokenSelectBetweenUneditable = result.safari || result.chrome && result.chrome_version < 63;
  function temporarilyEditableNear(view2, pos) {
    var ref = view2.docView.domFromPos(pos, 0);
    var node4 = ref.node;
    var offset2 = ref.offset;
    var after2 = offset2 < node4.childNodes.length ? node4.childNodes[offset2] : null;
    var before2 = offset2 ? node4.childNodes[offset2 - 1] : null;
    if (result.safari && after2 && after2.contentEditable == "false") {
      return setEditable(after2);
    }
    if ((!after2 || after2.contentEditable == "false") && (!before2 || before2.contentEditable == "false")) {
      if (after2) {
        return setEditable(after2);
      } else if (before2) {
        return setEditable(before2);
      }
    }
  }
  function setEditable(element) {
    element.contentEditable = "true";
    if (result.safari && element.draggable) {
      element.draggable = false;
      element.wasDraggable = true;
    }
    return element;
  }
  function resetEditable(element) {
    element.contentEditable = "false";
    if (element.wasDraggable) {
      element.draggable = true;
      element.wasDraggable = null;
    }
  }
  function removeClassOnSelectionChange(view2) {
    var doc2 = view2.dom.ownerDocument;
    doc2.removeEventListener("selectionchange", view2.hideSelectionGuard);
    var domSel = view2.root.getSelection();
    var node4 = domSel.anchorNode, offset2 = domSel.anchorOffset;
    doc2.addEventListener("selectionchange", view2.hideSelectionGuard = function() {
      if (domSel.anchorNode != node4 || domSel.anchorOffset != offset2) {
        doc2.removeEventListener("selectionchange", view2.hideSelectionGuard);
        setTimeout(function() {
          if (!editorOwnsSelection(view2) || view2.state.selection.visible) {
            view2.dom.classList.remove("ProseMirror-hideselection");
          }
        }, 20);
      }
    });
  }
  function selectCursorWrapper(view2) {
    var domSel = view2.root.getSelection(), range = document.createRange();
    var node4 = view2.cursorWrapper.dom, img = node4.nodeName == "IMG";
    if (img) {
      range.setEnd(node4.parentNode, domIndex(node4) + 1);
    } else {
      range.setEnd(node4, 0);
    }
    range.collapse(false);
    domSel.removeAllRanges();
    domSel.addRange(range);
    if (!img && !view2.state.selection.visible && result.ie && result.ie_version <= 11) {
      node4.disabled = true;
      node4.disabled = false;
    }
  }
  function syncNodeSelection(view2, sel) {
    if (sel instanceof NodeSelection) {
      var desc = view2.docView.descAt(sel.from);
      if (desc != view2.lastSelectedViewDesc) {
        clearNodeSelection(view2);
        if (desc) {
          desc.selectNode();
        }
        view2.lastSelectedViewDesc = desc;
      }
    } else {
      clearNodeSelection(view2);
    }
  }
  function clearNodeSelection(view2) {
    if (view2.lastSelectedViewDesc) {
      if (view2.lastSelectedViewDesc.parent) {
        view2.lastSelectedViewDesc.deselectNode();
      }
      view2.lastSelectedViewDesc = null;
    }
  }
  function selectionBetween(view2, $anchor, $head, bias) {
    return view2.someProp("createSelectionBetween", function(f) {
      return f(view2, $anchor, $head);
    }) || TextSelection.between($anchor, $head, bias);
  }
  function hasFocusAndSelection(view2) {
    if (view2.editable && view2.root.activeElement != view2.dom) {
      return false;
    }
    return hasSelection(view2);
  }
  function hasSelection(view2) {
    var sel = view2.root.getSelection();
    if (!sel.anchorNode) {
      return false;
    }
    try {
      return view2.dom.contains(sel.anchorNode.nodeType == 3 ? sel.anchorNode.parentNode : sel.anchorNode) && (view2.editable || view2.dom.contains(sel.focusNode.nodeType == 3 ? sel.focusNode.parentNode : sel.focusNode));
    } catch (_) {
      return false;
    }
  }
  function anchorInRightPlace(view2) {
    var anchorDOM = view2.docView.domFromPos(view2.state.selection.anchor, 0);
    var domSel = view2.root.getSelection();
    return isEquivalentPosition(anchorDOM.node, anchorDOM.offset, domSel.anchorNode, domSel.anchorOffset);
  }
  function moveSelectionBlock(state2, dir) {
    var ref = state2.selection;
    var $anchor = ref.$anchor;
    var $head = ref.$head;
    var $side = dir > 0 ? $anchor.max($head) : $anchor.min($head);
    var $start = !$side.parent.inlineContent ? $side : $side.depth ? state2.doc.resolve(dir > 0 ? $side.after() : $side.before()) : null;
    return $start && Selection.findFrom($start, dir);
  }
  function apply7(view2, sel) {
    view2.dispatch(view2.state.tr.setSelection(sel).scrollIntoView());
    return true;
  }
  function selectHorizontally(view2, dir, mods) {
    var sel = view2.state.selection;
    if (sel instanceof TextSelection) {
      if (!sel.empty || mods.indexOf("s") > -1) {
        return false;
      } else if (view2.endOfTextblock(dir > 0 ? "right" : "left")) {
        var next = moveSelectionBlock(view2.state, dir);
        if (next && next instanceof NodeSelection) {
          return apply7(view2, next);
        }
        return false;
      } else if (!(result.mac && mods.indexOf("m") > -1)) {
        var $head = sel.$head, node4 = $head.textOffset ? null : dir < 0 ? $head.nodeBefore : $head.nodeAfter, desc;
        if (!node4 || node4.isText) {
          return false;
        }
        var nodePos = dir < 0 ? $head.pos - node4.nodeSize : $head.pos;
        if (!(node4.isAtom || (desc = view2.docView.descAt(nodePos)) && !desc.contentDOM)) {
          return false;
        }
        if (NodeSelection.isSelectable(node4)) {
          return apply7(view2, new NodeSelection(dir < 0 ? view2.state.doc.resolve($head.pos - node4.nodeSize) : $head));
        } else if (result.webkit) {
          return apply7(view2, new TextSelection(view2.state.doc.resolve(dir < 0 ? nodePos : nodePos + node4.nodeSize)));
        } else {
          return false;
        }
      }
    } else if (sel instanceof NodeSelection && sel.node.isInline) {
      return apply7(view2, new TextSelection(dir > 0 ? sel.$to : sel.$from));
    } else {
      var next$1 = moveSelectionBlock(view2.state, dir);
      if (next$1) {
        return apply7(view2, next$1);
      }
      return false;
    }
  }
  function nodeLen(node4) {
    return node4.nodeType == 3 ? node4.nodeValue.length : node4.childNodes.length;
  }
  function isIgnorable(dom) {
    var desc = dom.pmViewDesc;
    return desc && desc.size == 0 && (dom.nextSibling || dom.nodeName != "BR");
  }
  function skipIgnoredNodesLeft(view2) {
    var sel = view2.root.getSelection();
    var node4 = sel.focusNode, offset2 = sel.focusOffset;
    if (!node4) {
      return;
    }
    var moveNode, moveOffset, force = false;
    if (result.gecko && node4.nodeType == 1 && offset2 < nodeLen(node4) && isIgnorable(node4.childNodes[offset2])) {
      force = true;
    }
    for (; ; ) {
      if (offset2 > 0) {
        if (node4.nodeType != 1) {
          break;
        } else {
          var before2 = node4.childNodes[offset2 - 1];
          if (isIgnorable(before2)) {
            moveNode = node4;
            moveOffset = --offset2;
          } else if (before2.nodeType == 3) {
            node4 = before2;
            offset2 = node4.nodeValue.length;
          } else {
            break;
          }
        }
      } else if (isBlockNode(node4)) {
        break;
      } else {
        var prev = node4.previousSibling;
        while (prev && isIgnorable(prev)) {
          moveNode = node4.parentNode;
          moveOffset = domIndex(prev);
          prev = prev.previousSibling;
        }
        if (!prev) {
          node4 = node4.parentNode;
          if (node4 == view2.dom) {
            break;
          }
          offset2 = 0;
        } else {
          node4 = prev;
          offset2 = nodeLen(node4);
        }
      }
    }
    if (force) {
      setSelFocus(view2, sel, node4, offset2);
    } else if (moveNode) {
      setSelFocus(view2, sel, moveNode, moveOffset);
    }
  }
  function skipIgnoredNodesRight(view2) {
    var sel = view2.root.getSelection();
    var node4 = sel.focusNode, offset2 = sel.focusOffset;
    if (!node4) {
      return;
    }
    var len = nodeLen(node4);
    var moveNode, moveOffset;
    for (; ; ) {
      if (offset2 < len) {
        if (node4.nodeType != 1) {
          break;
        }
        var after2 = node4.childNodes[offset2];
        if (isIgnorable(after2)) {
          moveNode = node4;
          moveOffset = ++offset2;
        } else {
          break;
        }
      } else if (isBlockNode(node4)) {
        break;
      } else {
        var next = node4.nextSibling;
        while (next && isIgnorable(next)) {
          moveNode = next.parentNode;
          moveOffset = domIndex(next) + 1;
          next = next.nextSibling;
        }
        if (!next) {
          node4 = node4.parentNode;
          if (node4 == view2.dom) {
            break;
          }
          offset2 = len = 0;
        } else {
          node4 = next;
          offset2 = 0;
          len = nodeLen(node4);
        }
      }
    }
    if (moveNode) {
      setSelFocus(view2, sel, moveNode, moveOffset);
    }
  }
  function isBlockNode(dom) {
    var desc = dom.pmViewDesc;
    return desc && desc.node && desc.node.isBlock;
  }
  function setSelFocus(view2, sel, node4, offset2) {
    if (selectionCollapsed(sel)) {
      var range = document.createRange();
      range.setEnd(node4, offset2);
      range.setStart(node4, offset2);
      sel.removeAllRanges();
      sel.addRange(range);
    } else if (sel.extend) {
      sel.extend(node4, offset2);
    }
    view2.domObserver.setCurSelection();
    var state2 = view2.state;
    setTimeout(function() {
      if (view2.state == state2) {
        selectionToDOM(view2);
      }
    }, 50);
  }
  function selectVertically(view2, dir, mods) {
    var sel = view2.state.selection;
    if (sel instanceof TextSelection && !sel.empty || mods.indexOf("s") > -1) {
      return false;
    }
    if (result.mac && mods.indexOf("m") > -1) {
      return false;
    }
    var $from = sel.$from;
    var $to = sel.$to;
    if (!$from.parent.inlineContent || view2.endOfTextblock(dir < 0 ? "up" : "down")) {
      var next = moveSelectionBlock(view2.state, dir);
      if (next && next instanceof NodeSelection) {
        return apply7(view2, next);
      }
    }
    if (!$from.parent.inlineContent) {
      var side = dir < 0 ? $from : $to;
      var beyond = sel instanceof AllSelection ? Selection.near(side, dir) : Selection.findFrom(side, dir);
      return beyond ? apply7(view2, beyond) : false;
    }
    return false;
  }
  function stopNativeHorizontalDelete(view2, dir) {
    if (!(view2.state.selection instanceof TextSelection)) {
      return true;
    }
    var ref = view2.state.selection;
    var $head = ref.$head;
    var $anchor = ref.$anchor;
    var empty2 = ref.empty;
    if (!$head.sameParent($anchor)) {
      return true;
    }
    if (!empty2) {
      return false;
    }
    if (view2.endOfTextblock(dir > 0 ? "forward" : "backward")) {
      return true;
    }
    var nextNode = !$head.textOffset && (dir < 0 ? $head.nodeBefore : $head.nodeAfter);
    if (nextNode && !nextNode.isText) {
      var tr = view2.state.tr;
      if (dir < 0) {
        tr.delete($head.pos - nextNode.nodeSize, $head.pos);
      } else {
        tr.delete($head.pos, $head.pos + nextNode.nodeSize);
      }
      view2.dispatch(tr);
      return true;
    }
    return false;
  }
  function switchEditable(view2, node4, state2) {
    view2.domObserver.stop();
    node4.contentEditable = state2;
    view2.domObserver.start();
  }
  function safariDownArrowBug(view2) {
    if (!result.safari || view2.state.selection.$head.parentOffset > 0) {
      return;
    }
    var ref = view2.root.getSelection();
    var focusNode = ref.focusNode;
    var focusOffset = ref.focusOffset;
    if (focusNode && focusNode.nodeType == 1 && focusOffset == 0 && focusNode.firstChild && focusNode.firstChild.contentEditable == "false") {
      var child3 = focusNode.firstChild;
      switchEditable(view2, child3, true);
      setTimeout(function() {
        return switchEditable(view2, child3, false);
      }, 20);
    }
  }
  function getMods(event) {
    var result2 = "";
    if (event.ctrlKey) {
      result2 += "c";
    }
    if (event.metaKey) {
      result2 += "m";
    }
    if (event.altKey) {
      result2 += "a";
    }
    if (event.shiftKey) {
      result2 += "s";
    }
    return result2;
  }
  function captureKeyDown(view2, event) {
    var code2 = event.keyCode, mods = getMods(event);
    if (code2 == 8 || result.mac && code2 == 72 && mods == "c") {
      return stopNativeHorizontalDelete(view2, -1) || skipIgnoredNodesLeft(view2);
    } else if (code2 == 46 || result.mac && code2 == 68 && mods == "c") {
      return stopNativeHorizontalDelete(view2, 1) || skipIgnoredNodesRight(view2);
    } else if (code2 == 13 || code2 == 27) {
      return true;
    } else if (code2 == 37) {
      return selectHorizontally(view2, -1, mods) || skipIgnoredNodesLeft(view2);
    } else if (code2 == 39) {
      return selectHorizontally(view2, 1, mods) || skipIgnoredNodesRight(view2);
    } else if (code2 == 38) {
      return selectVertically(view2, -1, mods) || skipIgnoredNodesLeft(view2);
    } else if (code2 == 40) {
      return safariDownArrowBug(view2) || selectVertically(view2, 1, mods) || skipIgnoredNodesRight(view2);
    } else if (mods == (result.mac ? "m" : "c") && (code2 == 66 || code2 == 73 || code2 == 89 || code2 == 90)) {
      return true;
    }
    return false;
  }
  function parseBetween(view2, from_, to_) {
    var ref = view2.docView.parseRange(from_, to_);
    var parent = ref.node;
    var fromOffset = ref.fromOffset;
    var toOffset = ref.toOffset;
    var from4 = ref.from;
    var to = ref.to;
    var domSel = view2.root.getSelection(), find2 = null, anchor = domSel.anchorNode;
    if (anchor && view2.dom.contains(anchor.nodeType == 1 ? anchor : anchor.parentNode)) {
      find2 = [{node: anchor, offset: domSel.anchorOffset}];
      if (!selectionCollapsed(domSel)) {
        find2.push({node: domSel.focusNode, offset: domSel.focusOffset});
      }
    }
    if (result.chrome && view2.lastKeyCode === 8) {
      for (var off = toOffset; off > fromOffset; off--) {
        var node4 = parent.childNodes[off - 1], desc = node4.pmViewDesc;
        if (node4.nodeName == "BR" && !desc) {
          toOffset = off;
          break;
        }
        if (!desc || desc.size) {
          break;
        }
      }
    }
    var startDoc = view2.state.doc;
    var parser = view2.someProp("domParser") || DOMParser.fromSchema(view2.state.schema);
    var $from = startDoc.resolve(from4);
    var sel = null, doc2 = parser.parse(parent, {
      topNode: $from.parent,
      topMatch: $from.parent.contentMatchAt($from.index()),
      topOpen: true,
      from: fromOffset,
      to: toOffset,
      preserveWhitespace: $from.parent.type.spec.code ? "full" : true,
      editableContent: true,
      findPositions: find2,
      ruleFromNode,
      context: $from
    });
    if (find2 && find2[0].pos != null) {
      var anchor$1 = find2[0].pos, head = find2[1] && find2[1].pos;
      if (head == null) {
        head = anchor$1;
      }
      sel = {anchor: anchor$1 + from4, head: head + from4};
    }
    return {doc: doc2, sel, from: from4, to};
  }
  function ruleFromNode(dom) {
    var desc = dom.pmViewDesc;
    if (desc) {
      return desc.parseRule();
    } else if (dom.nodeName == "BR" && dom.parentNode) {
      if (result.safari && /^(ul|ol)$/i.test(dom.parentNode.nodeName)) {
        var skip = document.createElement("div");
        skip.appendChild(document.createElement("li"));
        return {skip};
      } else if (dom.parentNode.lastChild == dom || result.safari && /^(tr|table)$/i.test(dom.parentNode.nodeName)) {
        return {ignore: true};
      }
    } else if (dom.nodeName == "IMG" && dom.getAttribute("mark-placeholder")) {
      return {ignore: true};
    }
  }
  function readDOMChange(view2, from4, to, typeOver, addedNodes) {
    if (from4 < 0) {
      var origin = view2.lastSelectionTime > Date.now() - 50 ? view2.lastSelectionOrigin : null;
      var newSel = selectionFromDOM(view2, origin);
      if (newSel && !view2.state.selection.eq(newSel)) {
        var tr$1 = view2.state.tr.setSelection(newSel);
        if (origin == "pointer") {
          tr$1.setMeta("pointer", true);
        } else if (origin == "key") {
          tr$1.scrollIntoView();
        }
        view2.dispatch(tr$1);
      }
      return;
    }
    var $before = view2.state.doc.resolve(from4);
    var shared = $before.sharedDepth(to);
    from4 = $before.before(shared + 1);
    to = view2.state.doc.resolve(to).after(shared + 1);
    var sel = view2.state.selection;
    var parse3 = parseBetween(view2, from4, to);
    if (result.chrome && view2.cursorWrapper && parse3.sel && parse3.sel.anchor == view2.cursorWrapper.deco.from) {
      var text2 = view2.cursorWrapper.deco.type.toDOM.nextSibling;
      var size = text2 && text2.nodeValue ? text2.nodeValue.length : 1;
      parse3.sel = {anchor: parse3.sel.anchor + size, head: parse3.sel.anchor + size};
    }
    var doc2 = view2.state.doc, compare = doc2.slice(parse3.from, parse3.to);
    var preferredPos, preferredSide;
    if (view2.lastKeyCode === 8 && Date.now() - 100 < view2.lastKeyCodeTime) {
      preferredPos = view2.state.selection.to;
      preferredSide = "end";
    } else {
      preferredPos = view2.state.selection.from;
      preferredSide = "start";
    }
    view2.lastKeyCode = null;
    var change = findDiff(compare.content, parse3.doc.content, parse3.from, preferredPos, preferredSide);
    if (!change) {
      if (typeOver && sel instanceof TextSelection && !sel.empty && sel.$head.sameParent(sel.$anchor) && !view2.composing && !(parse3.sel && parse3.sel.anchor != parse3.sel.head)) {
        change = {start: sel.from, endA: sel.to, endB: sel.to};
      } else if ((result.ios && view2.lastIOSEnter > Date.now() - 225 || result.android) && addedNodes.some(function(n) {
        return n.nodeName == "DIV" || n.nodeName == "P";
      }) && view2.someProp("handleKeyDown", function(f) {
        return f(view2, keyEvent(13, "Enter"));
      })) {
        view2.lastIOSEnter = 0;
        return;
      } else {
        if (parse3.sel) {
          var sel$1 = resolveSelection(view2, view2.state.doc, parse3.sel);
          if (sel$1 && !sel$1.eq(view2.state.selection)) {
            view2.dispatch(view2.state.tr.setSelection(sel$1));
          }
        }
        return;
      }
    }
    view2.domChangeCount++;
    if (view2.state.selection.from < view2.state.selection.to && change.start == change.endB && view2.state.selection instanceof TextSelection) {
      if (change.start > view2.state.selection.from && change.start <= view2.state.selection.from + 2) {
        change.start = view2.state.selection.from;
      } else if (change.endA < view2.state.selection.to && change.endA >= view2.state.selection.to - 2) {
        change.endB += view2.state.selection.to - change.endA;
        change.endA = view2.state.selection.to;
      }
    }
    if (result.ie && result.ie_version <= 11 && change.endB == change.start + 1 && change.endA == change.start && change.start > parse3.from && parse3.doc.textBetween(change.start - parse3.from - 1, change.start - parse3.from + 1) == " \xA0") {
      change.start--;
      change.endA--;
      change.endB--;
    }
    var $from = parse3.doc.resolveNoCache(change.start - parse3.from);
    var $to = parse3.doc.resolveNoCache(change.endB - parse3.from);
    var inlineChange = $from.sameParent($to) && $from.parent.inlineContent;
    var nextSel;
    if ((result.ios && view2.lastIOSEnter > Date.now() - 225 && (!inlineChange || addedNodes.some(function(n) {
      return n.nodeName == "DIV" || n.nodeName == "P";
    })) || !inlineChange && $from.pos < parse3.doc.content.size && (nextSel = Selection.findFrom(parse3.doc.resolve($from.pos + 1), 1, true)) && nextSel.head == $to.pos) && view2.someProp("handleKeyDown", function(f) {
      return f(view2, keyEvent(13, "Enter"));
    })) {
      view2.lastIOSEnter = 0;
      return;
    }
    if (view2.state.selection.anchor > change.start && looksLikeJoin(doc2, change.start, change.endA, $from, $to) && view2.someProp("handleKeyDown", function(f) {
      return f(view2, keyEvent(8, "Backspace"));
    })) {
      if (result.android && result.chrome) {
        view2.domObserver.suppressSelectionUpdates();
      }
      return;
    }
    if (result.chrome && result.android && change.toB == change.from) {
      view2.lastAndroidDelete = Date.now();
    }
    if (result.android && !inlineChange && $from.start() != $to.start() && $to.parentOffset == 0 && $from.depth == $to.depth && parse3.sel && parse3.sel.anchor == parse3.sel.head && parse3.sel.head == change.endA) {
      change.endB -= 2;
      $to = parse3.doc.resolveNoCache(change.endB - parse3.from);
      setTimeout(function() {
        view2.someProp("handleKeyDown", function(f) {
          return f(view2, keyEvent(13, "Enter"));
        });
      }, 20);
    }
    var chFrom = change.start, chTo = change.endA;
    var tr, storedMarks, markChange, $from1;
    if (inlineChange) {
      if ($from.pos == $to.pos) {
        if (result.ie && result.ie_version <= 11 && $from.parentOffset == 0) {
          view2.domObserver.suppressSelectionUpdates();
          setTimeout(function() {
            return selectionToDOM(view2);
          }, 20);
        }
        tr = view2.state.tr.delete(chFrom, chTo);
        storedMarks = doc2.resolve(change.start).marksAcross(doc2.resolve(change.endA));
      } else if (change.endA == change.endB && ($from1 = doc2.resolve(change.start)) && (markChange = isMarkChange($from.parent.content.cut($from.parentOffset, $to.parentOffset), $from1.parent.content.cut($from1.parentOffset, change.endA - $from1.start())))) {
        tr = view2.state.tr;
        if (markChange.type == "add") {
          tr.addMark(chFrom, chTo, markChange.mark);
        } else {
          tr.removeMark(chFrom, chTo, markChange.mark);
        }
      } else if ($from.parent.child($from.index()).isText && $from.index() == $to.index() - ($to.textOffset ? 0 : 1)) {
        var text$1 = $from.parent.textBetween($from.parentOffset, $to.parentOffset);
        if (view2.someProp("handleTextInput", function(f) {
          return f(view2, chFrom, chTo, text$1);
        })) {
          return;
        }
        tr = view2.state.tr.insertText(text$1, chFrom, chTo);
      }
    }
    if (!tr) {
      tr = view2.state.tr.replace(chFrom, chTo, parse3.doc.slice(change.start - parse3.from, change.endB - parse3.from));
    }
    if (parse3.sel) {
      var sel$2 = resolveSelection(view2, tr.doc, parse3.sel);
      if (sel$2 && !(result.chrome && result.android && view2.composing && sel$2.empty && (change.start != change.endB || view2.lastAndroidDelete < Date.now() - 100) && (sel$2.head == chFrom || sel$2.head == tr.mapping.map(chTo) - 1) || result.ie && sel$2.empty && sel$2.head == chFrom)) {
        tr.setSelection(sel$2);
      }
    }
    if (storedMarks) {
      tr.ensureMarks(storedMarks);
    }
    view2.dispatch(tr.scrollIntoView());
  }
  function resolveSelection(view2, doc2, parsedSel) {
    if (Math.max(parsedSel.anchor, parsedSel.head) > doc2.content.size) {
      return null;
    }
    return selectionBetween(view2, doc2.resolve(parsedSel.anchor), doc2.resolve(parsedSel.head));
  }
  function isMarkChange(cur, prev) {
    var curMarks = cur.firstChild.marks, prevMarks = prev.firstChild.marks;
    var added = curMarks, removed = prevMarks, type, mark3, update2;
    for (var i = 0; i < prevMarks.length; i++) {
      added = prevMarks[i].removeFromSet(added);
    }
    for (var i$1 = 0; i$1 < curMarks.length; i$1++) {
      removed = curMarks[i$1].removeFromSet(removed);
    }
    if (added.length == 1 && removed.length == 0) {
      mark3 = added[0];
      type = "add";
      update2 = function(node4) {
        return node4.mark(mark3.addToSet(node4.marks));
      };
    } else if (added.length == 0 && removed.length == 1) {
      mark3 = removed[0];
      type = "remove";
      update2 = function(node4) {
        return node4.mark(mark3.removeFromSet(node4.marks));
      };
    } else {
      return null;
    }
    var updated = [];
    for (var i$2 = 0; i$2 < prev.childCount; i$2++) {
      updated.push(update2(prev.child(i$2)));
    }
    if (Fragment.from(updated).eq(cur)) {
      return {mark: mark3, type};
    }
  }
  function looksLikeJoin(old, start3, end2, $newStart, $newEnd) {
    if (!$newStart.parent.isTextblock || end2 - start3 <= $newEnd.pos - $newStart.pos || skipClosingAndOpening($newStart, true, false) < $newEnd.pos) {
      return false;
    }
    var $start = old.resolve(start3);
    if ($start.parentOffset < $start.parent.content.size || !$start.parent.isTextblock) {
      return false;
    }
    var $next = old.resolve(skipClosingAndOpening($start, true, true));
    if (!$next.parent.isTextblock || $next.pos > end2 || skipClosingAndOpening($next, true, false) < end2) {
      return false;
    }
    return $newStart.parent.content.cut($newStart.parentOffset).eq($next.parent.content);
  }
  function skipClosingAndOpening($pos, fromEnd, mayOpen) {
    var depth = $pos.depth, end2 = fromEnd ? $pos.end() : $pos.pos;
    while (depth > 0 && (fromEnd || $pos.indexAfter(depth) == $pos.node(depth).childCount)) {
      depth--;
      end2++;
      fromEnd = false;
    }
    if (mayOpen) {
      var next = $pos.node(depth).maybeChild($pos.indexAfter(depth));
      while (next && !next.isLeaf) {
        next = next.firstChild;
        end2++;
      }
    }
    return end2;
  }
  function findDiff(a, b, pos, preferredPos, preferredSide) {
    var start3 = a.findDiffStart(b, pos);
    if (start3 == null) {
      return null;
    }
    var ref = a.findDiffEnd(b, pos + a.size, pos + b.size);
    var endA = ref.a;
    var endB = ref.b;
    if (preferredSide == "end") {
      var adjust = Math.max(0, start3 - Math.min(endA, endB));
      preferredPos -= endA + adjust - start3;
    }
    if (endA < start3 && a.size < b.size) {
      var move2 = preferredPos <= start3 && preferredPos >= endA ? start3 - preferredPos : 0;
      start3 -= move2;
      endB = start3 + (endB - endA);
      endA = start3;
    } else if (endB < start3) {
      var move$1 = preferredPos <= start3 && preferredPos >= endB ? start3 - preferredPos : 0;
      start3 -= move$1;
      endA = start3 + (endA - endB);
      endB = start3;
    }
    return {start: start3, endA, endB};
  }
  function serializeForClipboard(view2, slice4) {
    var context = [];
    var content2 = slice4.content;
    var openStart = slice4.openStart;
    var openEnd = slice4.openEnd;
    while (openStart > 1 && openEnd > 1 && content2.childCount == 1 && content2.firstChild.childCount == 1) {
      openStart--;
      openEnd--;
      var node4 = content2.firstChild;
      context.push(node4.type.name, node4.attrs != node4.type.defaultAttrs ? node4.attrs : null);
      content2 = node4.content;
    }
    var serializer = view2.someProp("clipboardSerializer") || DOMSerializer.fromSchema(view2.state.schema);
    var doc2 = detachedDoc(), wrap = doc2.createElement("div");
    wrap.appendChild(serializer.serializeFragment(content2, {document: doc2}));
    var firstChild = wrap.firstChild, needsWrap;
    while (firstChild && firstChild.nodeType == 1 && (needsWrap = wrapMap[firstChild.nodeName.toLowerCase()])) {
      for (var i = needsWrap.length - 1; i >= 0; i--) {
        var wrapper = doc2.createElement(needsWrap[i]);
        while (wrap.firstChild) {
          wrapper.appendChild(wrap.firstChild);
        }
        wrap.appendChild(wrapper);
        if (needsWrap[i] != "tbody") {
          openStart++;
          openEnd++;
        }
      }
      firstChild = wrap.firstChild;
    }
    if (firstChild && firstChild.nodeType == 1) {
      firstChild.setAttribute("data-pm-slice", openStart + " " + openEnd + " " + JSON.stringify(context));
    }
    var text2 = view2.someProp("clipboardTextSerializer", function(f) {
      return f(slice4);
    }) || slice4.content.textBetween(0, slice4.content.size, "\n\n");
    return {dom: wrap, text: text2};
  }
  function parseFromClipboard(view2, text2, html, plainText, $context) {
    var dom, inCode = $context.parent.type.spec.code, slice4;
    if (!html && !text2) {
      return null;
    }
    var asText = text2 && (plainText || inCode || !html);
    if (asText) {
      view2.someProp("transformPastedText", function(f) {
        text2 = f(text2, inCode || plainText);
      });
      if (inCode) {
        return text2 ? new Slice(Fragment.from(view2.state.schema.text(text2.replace(/\r\n?/g, "\n"))), 0, 0) : Slice.empty;
      }
      var parsed = view2.someProp("clipboardTextParser", function(f) {
        return f(text2, $context, plainText);
      });
      if (parsed) {
        slice4 = parsed;
      } else {
        var marks4 = $context.marks();
        var ref = view2.state;
        var schema2 = ref.schema;
        var serializer = DOMSerializer.fromSchema(schema2);
        dom = document.createElement("div");
        text2.split(/(?:\r\n?|\n)+/).forEach(function(block) {
          var p = dom.appendChild(document.createElement("p"));
          if (block) {
            p.appendChild(serializer.serializeNode(schema2.text(block, marks4)));
          }
        });
      }
    } else {
      view2.someProp("transformPastedHTML", function(f) {
        html = f(html);
      });
      dom = readHTML(html);
      if (result.webkit) {
        restoreReplacedSpaces(dom);
      }
    }
    var contextNode = dom && dom.querySelector("[data-pm-slice]");
    var sliceData = contextNode && /^(\d+) (\d+) (.*)/.exec(contextNode.getAttribute("data-pm-slice"));
    if (!slice4) {
      var parser = view2.someProp("clipboardParser") || view2.someProp("domParser") || DOMParser.fromSchema(view2.state.schema);
      slice4 = parser.parseSlice(dom, {
        preserveWhitespace: !!(asText || sliceData),
        context: $context,
        ruleFromNode: function ruleFromNode2(dom2) {
          if (dom2.nodeName == "BR" && !dom2.nextSibling) {
            return {ignore: true};
          }
        }
      });
    }
    if (sliceData) {
      slice4 = addContext(closeSlice(slice4, +sliceData[1], +sliceData[2]), sliceData[3]);
    } else {
      slice4 = Slice.maxOpen(normalizeSiblings(slice4.content, $context), true);
      if (slice4.openStart || slice4.openEnd) {
        var openStart = 0, openEnd = 0;
        for (var node4 = slice4.content.firstChild; openStart < slice4.openStart && !node4.type.spec.isolating; openStart++, node4 = node4.firstChild) {
        }
        for (var node$1 = slice4.content.lastChild; openEnd < slice4.openEnd && !node$1.type.spec.isolating; openEnd++, node$1 = node$1.lastChild) {
        }
        slice4 = closeSlice(slice4, openStart, openEnd);
      }
    }
    view2.someProp("transformPasted", function(f) {
      slice4 = f(slice4);
    });
    return slice4;
  }
  function normalizeSiblings(fragment, $context) {
    if (fragment.childCount < 2) {
      return fragment;
    }
    var loop = function(d2) {
      var parent = $context.node(d2);
      var match = parent.contentMatchAt($context.index(d2));
      var lastWrap = void 0, result2 = [];
      fragment.forEach(function(node4) {
        if (!result2) {
          return;
        }
        var wrap = match.findWrapping(node4.type), inLast;
        if (!wrap) {
          return result2 = null;
        }
        if (inLast = result2.length && lastWrap.length && addToSibling(wrap, lastWrap, node4, result2[result2.length - 1], 0)) {
          result2[result2.length - 1] = inLast;
        } else {
          if (result2.length) {
            result2[result2.length - 1] = closeRight(result2[result2.length - 1], lastWrap.length);
          }
          var wrapped = withWrappers(node4, wrap);
          result2.push(wrapped);
          match = match.matchType(wrapped.type, wrapped.attrs);
          lastWrap = wrap;
        }
      });
      if (result2) {
        return {v: Fragment.from(result2)};
      }
    };
    for (var d = $context.depth; d >= 0; d--) {
      var returned = loop(d);
      if (returned)
        return returned.v;
    }
    return fragment;
  }
  function withWrappers(node4, wrap, from4) {
    if (from4 === void 0)
      from4 = 0;
    for (var i = wrap.length - 1; i >= from4; i--) {
      node4 = wrap[i].create(null, Fragment.from(node4));
    }
    return node4;
  }
  function addToSibling(wrap, lastWrap, node4, sibling, depth) {
    if (depth < wrap.length && depth < lastWrap.length && wrap[depth] == lastWrap[depth]) {
      var inner = addToSibling(wrap, lastWrap, node4, sibling.lastChild, depth + 1);
      if (inner) {
        return sibling.copy(sibling.content.replaceChild(sibling.childCount - 1, inner));
      }
      var match = sibling.contentMatchAt(sibling.childCount);
      if (match.matchType(depth == wrap.length - 1 ? node4.type : wrap[depth + 1])) {
        return sibling.copy(sibling.content.append(Fragment.from(withWrappers(node4, wrap, depth + 1))));
      }
    }
  }
  function closeRight(node4, depth) {
    if (depth == 0) {
      return node4;
    }
    var fragment = node4.content.replaceChild(node4.childCount - 1, closeRight(node4.lastChild, depth - 1));
    var fill = node4.contentMatchAt(node4.childCount).fillBefore(Fragment.empty, true);
    return node4.copy(fragment.append(fill));
  }
  function closeRange(fragment, side, from4, to, depth, openEnd) {
    var node4 = side < 0 ? fragment.firstChild : fragment.lastChild, inner = node4.content;
    if (depth < to - 1) {
      inner = closeRange(inner, side, from4, to, depth + 1, openEnd);
    }
    if (depth >= from4) {
      inner = side < 0 ? node4.contentMatchAt(0).fillBefore(inner, fragment.childCount > 1 || openEnd <= depth).append(inner) : inner.append(node4.contentMatchAt(node4.childCount).fillBefore(Fragment.empty, true));
    }
    return fragment.replaceChild(side < 0 ? 0 : fragment.childCount - 1, node4.copy(inner));
  }
  function closeSlice(slice4, openStart, openEnd) {
    if (openStart < slice4.openStart) {
      slice4 = new Slice(closeRange(slice4.content, -1, openStart, slice4.openStart, 0, slice4.openEnd), openStart, slice4.openEnd);
    }
    if (openEnd < slice4.openEnd) {
      slice4 = new Slice(closeRange(slice4.content, 1, openEnd, slice4.openEnd, 0, 0), slice4.openStart, openEnd);
    }
    return slice4;
  }
  var wrapMap = {
    thead: ["table"],
    tbody: ["table"],
    tfoot: ["table"],
    caption: ["table"],
    colgroup: ["table"],
    col: ["table", "colgroup"],
    tr: ["table", "tbody"],
    td: ["table", "tbody", "tr"],
    th: ["table", "tbody", "tr"]
  };
  var _detachedDoc = null;
  function detachedDoc() {
    return _detachedDoc || (_detachedDoc = document.implementation.createHTMLDocument("title"));
  }
  function readHTML(html) {
    var metas = /^(\s*<meta [^>]*>)*/.exec(html);
    if (metas) {
      html = html.slice(metas[0].length);
    }
    var elt = detachedDoc().createElement("div");
    var firstTag = /<([a-z][^>\s]+)/i.exec(html), wrap;
    if (wrap = firstTag && wrapMap[firstTag[1].toLowerCase()]) {
      html = wrap.map(function(n) {
        return "<" + n + ">";
      }).join("") + html + wrap.map(function(n) {
        return "</" + n + ">";
      }).reverse().join("");
    }
    elt.innerHTML = html;
    if (wrap) {
      for (var i = 0; i < wrap.length; i++) {
        elt = elt.querySelector(wrap[i]) || elt;
      }
    }
    return elt;
  }
  function restoreReplacedSpaces(dom) {
    var nodes3 = dom.querySelectorAll(result.chrome ? "span:not([class]):not([style])" : "span.Apple-converted-space");
    for (var i = 0; i < nodes3.length; i++) {
      var node4 = nodes3[i];
      if (node4.childNodes.length == 1 && node4.textContent == "\xA0" && node4.parentNode) {
        node4.parentNode.replaceChild(dom.ownerDocument.createTextNode(" "), node4);
      }
    }
  }
  function addContext(slice4, context) {
    if (!slice4.size) {
      return slice4;
    }
    var schema2 = slice4.content.firstChild.type.schema, array;
    try {
      array = JSON.parse(context);
    } catch (e) {
      return slice4;
    }
    var content2 = slice4.content;
    var openStart = slice4.openStart;
    var openEnd = slice4.openEnd;
    for (var i = array.length - 2; i >= 0; i -= 2) {
      var type = schema2.nodes[array[i]];
      if (!type || type.hasRequiredAttrs()) {
        break;
      }
      content2 = Fragment.from(type.create(array[i + 1], content2));
      openStart++;
      openEnd++;
    }
    return new Slice(content2, openStart, openEnd);
  }
  var observeOptions = {
    childList: true,
    characterData: true,
    characterDataOldValue: true,
    attributes: true,
    attributeOldValue: true,
    subtree: true
  };
  var useCharData = result.ie && result.ie_version <= 11;
  var SelectionState = function SelectionState2() {
    this.anchorNode = this.anchorOffset = this.focusNode = this.focusOffset = null;
  };
  SelectionState.prototype.set = function set(sel) {
    this.anchorNode = sel.anchorNode;
    this.anchorOffset = sel.anchorOffset;
    this.focusNode = sel.focusNode;
    this.focusOffset = sel.focusOffset;
  };
  SelectionState.prototype.eq = function eq5(sel) {
    return sel.anchorNode == this.anchorNode && sel.anchorOffset == this.anchorOffset && sel.focusNode == this.focusNode && sel.focusOffset == this.focusOffset;
  };
  var DOMObserver = function DOMObserver2(view2, handleDOMChange) {
    var this$1 = this;
    this.view = view2;
    this.handleDOMChange = handleDOMChange;
    this.queue = [];
    this.flushingSoon = -1;
    this.observer = window.MutationObserver && new window.MutationObserver(function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        this$1.queue.push(mutations[i]);
      }
      if (result.ie && result.ie_version <= 11 && mutations.some(function(m) {
        return m.type == "childList" && m.removedNodes.length || m.type == "characterData" && m.oldValue.length > m.target.nodeValue.length;
      })) {
        this$1.flushSoon();
      } else {
        this$1.flush();
      }
    });
    this.currentSelection = new SelectionState();
    if (useCharData) {
      this.onCharData = function(e) {
        this$1.queue.push({target: e.target, type: "characterData", oldValue: e.prevValue});
        this$1.flushSoon();
      };
    }
    this.onSelectionChange = this.onSelectionChange.bind(this);
    this.suppressingSelectionUpdates = false;
  };
  DOMObserver.prototype.flushSoon = function flushSoon() {
    var this$1 = this;
    if (this.flushingSoon < 0) {
      this.flushingSoon = window.setTimeout(function() {
        this$1.flushingSoon = -1;
        this$1.flush();
      }, 20);
    }
  };
  DOMObserver.prototype.forceFlush = function forceFlush() {
    if (this.flushingSoon > -1) {
      window.clearTimeout(this.flushingSoon);
      this.flushingSoon = -1;
      this.flush();
    }
  };
  DOMObserver.prototype.start = function start2() {
    if (this.observer) {
      this.observer.observe(this.view.dom, observeOptions);
    }
    if (useCharData) {
      this.view.dom.addEventListener("DOMCharacterDataModified", this.onCharData);
    }
    this.connectSelection();
  };
  DOMObserver.prototype.stop = function stop() {
    var this$1 = this;
    if (this.observer) {
      var take = this.observer.takeRecords();
      if (take.length) {
        for (var i = 0; i < take.length; i++) {
          this.queue.push(take[i]);
        }
        window.setTimeout(function() {
          return this$1.flush();
        }, 20);
      }
      this.observer.disconnect();
    }
    if (useCharData) {
      this.view.dom.removeEventListener("DOMCharacterDataModified", this.onCharData);
    }
    this.disconnectSelection();
  };
  DOMObserver.prototype.connectSelection = function connectSelection() {
    this.view.dom.ownerDocument.addEventListener("selectionchange", this.onSelectionChange);
  };
  DOMObserver.prototype.disconnectSelection = function disconnectSelection() {
    this.view.dom.ownerDocument.removeEventListener("selectionchange", this.onSelectionChange);
  };
  DOMObserver.prototype.suppressSelectionUpdates = function suppressSelectionUpdates() {
    var this$1 = this;
    this.suppressingSelectionUpdates = true;
    setTimeout(function() {
      return this$1.suppressingSelectionUpdates = false;
    }, 50);
  };
  DOMObserver.prototype.onSelectionChange = function onSelectionChange() {
    if (!hasFocusAndSelection(this.view)) {
      return;
    }
    if (this.suppressingSelectionUpdates) {
      return selectionToDOM(this.view);
    }
    if (result.ie && result.ie_version <= 11 && !this.view.state.selection.empty) {
      var sel = this.view.root.getSelection();
      if (sel.focusNode && isEquivalentPosition(sel.focusNode, sel.focusOffset, sel.anchorNode, sel.anchorOffset)) {
        return this.flushSoon();
      }
    }
    this.flush();
  };
  DOMObserver.prototype.setCurSelection = function setCurSelection() {
    this.currentSelection.set(this.view.root.getSelection());
  };
  DOMObserver.prototype.ignoreSelectionChange = function ignoreSelectionChange(sel) {
    if (sel.rangeCount == 0) {
      return true;
    }
    var container = sel.getRangeAt(0).commonAncestorContainer;
    var desc = this.view.docView.nearestDesc(container);
    if (desc && desc.ignoreMutation({type: "selection", target: container.nodeType == 3 ? container.parentNode : container})) {
      this.setCurSelection();
      return true;
    }
  };
  DOMObserver.prototype.flush = function flush() {
    if (!this.view.docView || this.flushingSoon > -1) {
      return;
    }
    var mutations = this.observer ? this.observer.takeRecords() : [];
    if (this.queue.length) {
      mutations = this.queue.concat(mutations);
      this.queue.length = 0;
    }
    var sel = this.view.root.getSelection();
    var newSel = !this.suppressingSelectionUpdates && !this.currentSelection.eq(sel) && hasSelection(this.view) && !this.ignoreSelectionChange(sel);
    var from4 = -1, to = -1, typeOver = false, added = [];
    if (this.view.editable) {
      for (var i = 0; i < mutations.length; i++) {
        var result$1 = this.registerMutation(mutations[i], added);
        if (result$1) {
          from4 = from4 < 0 ? result$1.from : Math.min(result$1.from, from4);
          to = to < 0 ? result$1.to : Math.max(result$1.to, to);
          if (result$1.typeOver) {
            typeOver = true;
          }
        }
      }
    }
    if (result.gecko && added.length > 1) {
      var brs = added.filter(function(n) {
        return n.nodeName == "BR";
      });
      if (brs.length == 2) {
        var a = brs[0];
        var b = brs[1];
        if (a.parentNode && a.parentNode.parentNode == b.parentNode) {
          b.remove();
        } else {
          a.remove();
        }
      }
    }
    if (from4 > -1 || newSel) {
      if (from4 > -1) {
        this.view.docView.markDirty(from4, to);
        checkCSS(this.view);
      }
      this.handleDOMChange(from4, to, typeOver, added);
      if (this.view.docView.dirty) {
        this.view.updateState(this.view.state);
      } else if (!this.currentSelection.eq(sel)) {
        selectionToDOM(this.view);
      }
      this.currentSelection.set(sel);
    }
  };
  DOMObserver.prototype.registerMutation = function registerMutation(mut, added) {
    if (added.indexOf(mut.target) > -1) {
      return null;
    }
    var desc = this.view.docView.nearestDesc(mut.target);
    if (mut.type == "attributes" && (desc == this.view.docView || mut.attributeName == "contenteditable" || mut.attributeName == "style" && !mut.oldValue && !mut.target.getAttribute("style"))) {
      return null;
    }
    if (!desc || desc.ignoreMutation(mut)) {
      return null;
    }
    if (mut.type == "childList") {
      for (var i = 0; i < mut.addedNodes.length; i++) {
        added.push(mut.addedNodes[i]);
      }
      if (desc.contentDOM && desc.contentDOM != desc.dom && !desc.contentDOM.contains(mut.target)) {
        return {from: desc.posBefore, to: desc.posAfter};
      }
      var prev = mut.previousSibling, next = mut.nextSibling;
      if (result.ie && result.ie_version <= 11 && mut.addedNodes.length) {
        for (var i$1 = 0; i$1 < mut.addedNodes.length; i$1++) {
          var ref = mut.addedNodes[i$1];
          var previousSibling = ref.previousSibling;
          var nextSibling = ref.nextSibling;
          if (!previousSibling || Array.prototype.indexOf.call(mut.addedNodes, previousSibling) < 0) {
            prev = previousSibling;
          }
          if (!nextSibling || Array.prototype.indexOf.call(mut.addedNodes, nextSibling) < 0) {
            next = nextSibling;
          }
        }
      }
      var fromOffset = prev && prev.parentNode == mut.target ? domIndex(prev) + 1 : 0;
      var from4 = desc.localPosFromDOM(mut.target, fromOffset, -1);
      var toOffset = next && next.parentNode == mut.target ? domIndex(next) : mut.target.childNodes.length;
      var to = desc.localPosFromDOM(mut.target, toOffset, 1);
      return {from: from4, to};
    } else if (mut.type == "attributes") {
      return {from: desc.posAtStart - desc.border, to: desc.posAtEnd + desc.border};
    } else {
      return {
        from: desc.posAtStart,
        to: desc.posAtEnd,
        typeOver: mut.target.nodeValue == mut.oldValue
      };
    }
  };
  var cssChecked = false;
  function checkCSS(view2) {
    if (cssChecked) {
      return;
    }
    cssChecked = true;
    if (getComputedStyle(view2.dom).whiteSpace == "normal") {
      console["warn"]("ProseMirror expects the CSS white-space property to be set, preferably to 'pre-wrap'. It is recommended to load style/prosemirror.css from the prosemirror-view package.");
    }
  }
  var handlers = {};
  var editHandlers = {};
  function initInput(view2) {
    view2.shiftKey = false;
    view2.mouseDown = null;
    view2.lastKeyCode = null;
    view2.lastKeyCodeTime = 0;
    view2.lastClick = {time: 0, x: 0, y: 0, type: ""};
    view2.lastSelectionOrigin = null;
    view2.lastSelectionTime = 0;
    view2.lastIOSEnter = 0;
    view2.lastIOSEnterFallbackTimeout = null;
    view2.lastAndroidDelete = 0;
    view2.composing = false;
    view2.composingTimeout = null;
    view2.compositionNodes = [];
    view2.compositionEndedAt = -2e8;
    view2.domObserver = new DOMObserver(view2, function(from4, to, typeOver, added) {
      return readDOMChange(view2, from4, to, typeOver, added);
    });
    view2.domObserver.start();
    view2.domChangeCount = 0;
    view2.eventHandlers = Object.create(null);
    var loop = function(event2) {
      var handler = handlers[event2];
      view2.dom.addEventListener(event2, view2.eventHandlers[event2] = function(event3) {
        if (eventBelongsToView(view2, event3) && !runCustomHandler(view2, event3) && (view2.editable || !(event3.type in editHandlers))) {
          handler(view2, event3);
        }
      });
    };
    for (var event in handlers)
      loop(event);
    if (result.safari) {
      view2.dom.addEventListener("input", function() {
        return null;
      });
    }
    ensureListeners(view2);
  }
  function setSelectionOrigin(view2, origin) {
    view2.lastSelectionOrigin = origin;
    view2.lastSelectionTime = Date.now();
  }
  function destroyInput(view2) {
    view2.domObserver.stop();
    for (var type in view2.eventHandlers) {
      view2.dom.removeEventListener(type, view2.eventHandlers[type]);
    }
    clearTimeout(view2.composingTimeout);
    clearTimeout(view2.lastIOSEnterFallbackTimeout);
  }
  function ensureListeners(view2) {
    view2.someProp("handleDOMEvents", function(currentHandlers) {
      for (var type in currentHandlers) {
        if (!view2.eventHandlers[type]) {
          view2.dom.addEventListener(type, view2.eventHandlers[type] = function(event) {
            return runCustomHandler(view2, event);
          });
        }
      }
    });
  }
  function runCustomHandler(view2, event) {
    return view2.someProp("handleDOMEvents", function(handlers2) {
      var handler = handlers2[event.type];
      return handler ? handler(view2, event) || event.defaultPrevented : false;
    });
  }
  function eventBelongsToView(view2, event) {
    if (!event.bubbles) {
      return true;
    }
    if (event.defaultPrevented) {
      return false;
    }
    for (var node4 = event.target; node4 != view2.dom; node4 = node4.parentNode) {
      if (!node4 || node4.nodeType == 11 || node4.pmViewDesc && node4.pmViewDesc.stopEvent(event)) {
        return false;
      }
    }
    return true;
  }
  function dispatchEvent(view2, event) {
    if (!runCustomHandler(view2, event) && handlers[event.type] && (view2.editable || !(event.type in editHandlers))) {
      handlers[event.type](view2, event);
    }
  }
  editHandlers.keydown = function(view2, event) {
    view2.shiftKey = event.keyCode == 16 || event.shiftKey;
    if (inOrNearComposition(view2, event)) {
      return;
    }
    if (event.keyCode != 229) {
      view2.domObserver.forceFlush();
    }
    view2.lastKeyCode = event.keyCode;
    view2.lastKeyCodeTime = Date.now();
    if (result.ios && event.keyCode == 13 && !event.ctrlKey && !event.altKey && !event.metaKey) {
      var now = Date.now();
      view2.lastIOSEnter = now;
      view2.lastIOSEnterFallbackTimeout = setTimeout(function() {
        if (view2.lastIOSEnter == now) {
          view2.someProp("handleKeyDown", function(f) {
            return f(view2, keyEvent(13, "Enter"));
          });
          view2.lastIOSEnter = 0;
        }
      }, 200);
    } else if (view2.someProp("handleKeyDown", function(f) {
      return f(view2, event);
    }) || captureKeyDown(view2, event)) {
      event.preventDefault();
    } else {
      setSelectionOrigin(view2, "key");
    }
  };
  editHandlers.keyup = function(view2, e) {
    if (e.keyCode == 16) {
      view2.shiftKey = false;
    }
  };
  editHandlers.keypress = function(view2, event) {
    if (inOrNearComposition(view2, event) || !event.charCode || event.ctrlKey && !event.altKey || result.mac && event.metaKey) {
      return;
    }
    if (view2.someProp("handleKeyPress", function(f) {
      return f(view2, event);
    })) {
      event.preventDefault();
      return;
    }
    var sel = view2.state.selection;
    if (!(sel instanceof TextSelection) || !sel.$from.sameParent(sel.$to)) {
      var text2 = String.fromCharCode(event.charCode);
      if (!view2.someProp("handleTextInput", function(f) {
        return f(view2, sel.$from.pos, sel.$to.pos, text2);
      })) {
        view2.dispatch(view2.state.tr.insertText(text2).scrollIntoView());
      }
      event.preventDefault();
    }
  };
  function eventCoords(event) {
    return {left: event.clientX, top: event.clientY};
  }
  function isNear(event, click) {
    var dx = click.x - event.clientX, dy = click.y - event.clientY;
    return dx * dx + dy * dy < 100;
  }
  function runHandlerOnContext(view2, propName, pos, inside, event) {
    if (inside == -1) {
      return false;
    }
    var $pos = view2.state.doc.resolve(inside);
    var loop = function(i2) {
      if (view2.someProp(propName, function(f) {
        return i2 > $pos.depth ? f(view2, pos, $pos.nodeAfter, $pos.before(i2), event, true) : f(view2, pos, $pos.node(i2), $pos.before(i2), event, false);
      })) {
        return {v: true};
      }
    };
    for (var i = $pos.depth + 1; i > 0; i--) {
      var returned = loop(i);
      if (returned)
        return returned.v;
    }
    return false;
  }
  function updateSelection(view2, selection, origin) {
    if (!view2.focused) {
      view2.focus();
    }
    var tr = view2.state.tr.setSelection(selection);
    if (origin == "pointer") {
      tr.setMeta("pointer", true);
    }
    view2.dispatch(tr);
  }
  function selectClickedLeaf(view2, inside) {
    if (inside == -1) {
      return false;
    }
    var $pos = view2.state.doc.resolve(inside), node4 = $pos.nodeAfter;
    if (node4 && node4.isAtom && NodeSelection.isSelectable(node4)) {
      updateSelection(view2, new NodeSelection($pos), "pointer");
      return true;
    }
    return false;
  }
  function selectClickedNode(view2, inside) {
    if (inside == -1) {
      return false;
    }
    var sel = view2.state.selection, selectedNode, selectAt;
    if (sel instanceof NodeSelection) {
      selectedNode = sel.node;
    }
    var $pos = view2.state.doc.resolve(inside);
    for (var i = $pos.depth + 1; i > 0; i--) {
      var node4 = i > $pos.depth ? $pos.nodeAfter : $pos.node(i);
      if (NodeSelection.isSelectable(node4)) {
        if (selectedNode && sel.$from.depth > 0 && i >= sel.$from.depth && $pos.before(sel.$from.depth + 1) == sel.$from.pos) {
          selectAt = $pos.before(sel.$from.depth);
        } else {
          selectAt = $pos.before(i);
        }
        break;
      }
    }
    if (selectAt != null) {
      updateSelection(view2, NodeSelection.create(view2.state.doc, selectAt), "pointer");
      return true;
    } else {
      return false;
    }
  }
  function handleSingleClick(view2, pos, inside, event, selectNode) {
    return runHandlerOnContext(view2, "handleClickOn", pos, inside, event) || view2.someProp("handleClick", function(f) {
      return f(view2, pos, event);
    }) || (selectNode ? selectClickedNode(view2, inside) : selectClickedLeaf(view2, inside));
  }
  function handleDoubleClick(view2, pos, inside, event) {
    return runHandlerOnContext(view2, "handleDoubleClickOn", pos, inside, event) || view2.someProp("handleDoubleClick", function(f) {
      return f(view2, pos, event);
    });
  }
  function handleTripleClick(view2, pos, inside, event) {
    return runHandlerOnContext(view2, "handleTripleClickOn", pos, inside, event) || view2.someProp("handleTripleClick", function(f) {
      return f(view2, pos, event);
    }) || defaultTripleClick(view2, inside, event);
  }
  function defaultTripleClick(view2, inside, event) {
    if (event.button != 0) {
      return false;
    }
    var doc2 = view2.state.doc;
    if (inside == -1) {
      if (doc2.inlineContent) {
        updateSelection(view2, TextSelection.create(doc2, 0, doc2.content.size), "pointer");
        return true;
      }
      return false;
    }
    var $pos = doc2.resolve(inside);
    for (var i = $pos.depth + 1; i > 0; i--) {
      var node4 = i > $pos.depth ? $pos.nodeAfter : $pos.node(i);
      var nodePos = $pos.before(i);
      if (node4.inlineContent) {
        updateSelection(view2, TextSelection.create(doc2, nodePos + 1, nodePos + 1 + node4.content.size), "pointer");
      } else if (NodeSelection.isSelectable(node4)) {
        updateSelection(view2, NodeSelection.create(doc2, nodePos), "pointer");
      } else {
        continue;
      }
      return true;
    }
  }
  function forceDOMFlush(view2) {
    return endComposition(view2);
  }
  var selectNodeModifier = result.mac ? "metaKey" : "ctrlKey";
  handlers.mousedown = function(view2, event) {
    view2.shiftKey = event.shiftKey;
    var flushed = forceDOMFlush(view2);
    var now = Date.now(), type = "singleClick";
    if (now - view2.lastClick.time < 500 && isNear(event, view2.lastClick) && !event[selectNodeModifier]) {
      if (view2.lastClick.type == "singleClick") {
        type = "doubleClick";
      } else if (view2.lastClick.type == "doubleClick") {
        type = "tripleClick";
      }
    }
    view2.lastClick = {time: now, x: event.clientX, y: event.clientY, type};
    var pos = view2.posAtCoords(eventCoords(event));
    if (!pos) {
      return;
    }
    if (type == "singleClick") {
      if (view2.mouseDown) {
        view2.mouseDown.done();
      }
      view2.mouseDown = new MouseDown(view2, pos, event, flushed);
    } else if ((type == "doubleClick" ? handleDoubleClick : handleTripleClick)(view2, pos.pos, pos.inside, event)) {
      event.preventDefault();
    } else {
      setSelectionOrigin(view2, "pointer");
    }
  };
  var MouseDown = function MouseDown2(view2, pos, event, flushed) {
    var this$1 = this;
    this.view = view2;
    this.startDoc = view2.state.doc;
    this.pos = pos;
    this.event = event;
    this.flushed = flushed;
    this.selectNode = event[selectNodeModifier];
    this.allowDefault = event.shiftKey;
    this.delayedSelectionSync = false;
    var targetNode, targetPos;
    if (pos.inside > -1) {
      targetNode = view2.state.doc.nodeAt(pos.inside);
      targetPos = pos.inside;
    } else {
      var $pos = view2.state.doc.resolve(pos.pos);
      targetNode = $pos.parent;
      targetPos = $pos.depth ? $pos.before() : 0;
    }
    this.mightDrag = null;
    var target = flushed ? null : event.target;
    var targetDesc = target ? view2.docView.nearestDesc(target, true) : null;
    this.target = targetDesc ? targetDesc.dom : null;
    var ref = view2.state;
    var selection = ref.selection;
    if (event.button == 0 && targetNode.type.spec.draggable && targetNode.type.spec.selectable !== false || selection instanceof NodeSelection && selection.from <= targetPos && selection.to > targetPos) {
      this.mightDrag = {
        node: targetNode,
        pos: targetPos,
        addAttr: this.target && !this.target.draggable,
        setUneditable: this.target && result.gecko && !this.target.hasAttribute("contentEditable")
      };
    }
    if (this.target && this.mightDrag && (this.mightDrag.addAttr || this.mightDrag.setUneditable)) {
      this.view.domObserver.stop();
      if (this.mightDrag.addAttr) {
        this.target.draggable = true;
      }
      if (this.mightDrag.setUneditable) {
        setTimeout(function() {
          if (this$1.view.mouseDown == this$1) {
            this$1.target.setAttribute("contentEditable", "false");
          }
        }, 20);
      }
      this.view.domObserver.start();
    }
    view2.root.addEventListener("mouseup", this.up = this.up.bind(this));
    view2.root.addEventListener("mousemove", this.move = this.move.bind(this));
    setSelectionOrigin(view2, "pointer");
  };
  MouseDown.prototype.done = function done() {
    var this$1 = this;
    this.view.root.removeEventListener("mouseup", this.up);
    this.view.root.removeEventListener("mousemove", this.move);
    if (this.mightDrag && this.target) {
      this.view.domObserver.stop();
      if (this.mightDrag.addAttr) {
        this.target.removeAttribute("draggable");
      }
      if (this.mightDrag.setUneditable) {
        this.target.removeAttribute("contentEditable");
      }
      this.view.domObserver.start();
    }
    if (this.delayedSelectionSync) {
      setTimeout(function() {
        return selectionToDOM(this$1.view);
      });
    }
    this.view.mouseDown = null;
  };
  MouseDown.prototype.up = function up(event) {
    this.done();
    if (!this.view.dom.contains(event.target.nodeType == 3 ? event.target.parentNode : event.target)) {
      return;
    }
    var pos = this.pos;
    if (this.view.state.doc != this.startDoc) {
      pos = this.view.posAtCoords(eventCoords(event));
    }
    if (this.allowDefault || !pos) {
      setSelectionOrigin(this.view, "pointer");
    } else if (handleSingleClick(this.view, pos.pos, pos.inside, event, this.selectNode)) {
      event.preventDefault();
    } else if (event.button == 0 && (this.flushed || result.safari && this.mightDrag && !this.mightDrag.node.isAtom || result.chrome && !(this.view.state.selection instanceof TextSelection) && Math.min(Math.abs(pos.pos - this.view.state.selection.from), Math.abs(pos.pos - this.view.state.selection.to)) <= 2)) {
      updateSelection(this.view, Selection.near(this.view.state.doc.resolve(pos.pos)), "pointer");
      event.preventDefault();
    } else {
      setSelectionOrigin(this.view, "pointer");
    }
  };
  MouseDown.prototype.move = function move(event) {
    if (!this.allowDefault && (Math.abs(this.event.x - event.clientX) > 4 || Math.abs(this.event.y - event.clientY) > 4)) {
      this.allowDefault = true;
    }
    setSelectionOrigin(this.view, "pointer");
    if (event.buttons == 0) {
      this.done();
    }
  };
  handlers.touchdown = function(view2) {
    forceDOMFlush(view2);
    setSelectionOrigin(view2, "pointer");
  };
  handlers.contextmenu = function(view2) {
    return forceDOMFlush(view2);
  };
  function inOrNearComposition(view2, event) {
    if (view2.composing) {
      return true;
    }
    if (result.safari && Math.abs(event.timeStamp - view2.compositionEndedAt) < 500) {
      view2.compositionEndedAt = -2e8;
      return true;
    }
    return false;
  }
  var timeoutComposition = result.android ? 5e3 : -1;
  editHandlers.compositionstart = editHandlers.compositionupdate = function(view2) {
    if (!view2.composing) {
      view2.domObserver.flush();
      var state2 = view2.state;
      var $pos = state2.selection.$from;
      if (state2.selection.empty && (state2.storedMarks || !$pos.textOffset && $pos.parentOffset && $pos.nodeBefore.marks.some(function(m) {
        return m.type.spec.inclusive === false;
      }))) {
        view2.markCursor = view2.state.storedMarks || $pos.marks();
        endComposition(view2, true);
        view2.markCursor = null;
      } else {
        endComposition(view2);
        if (result.gecko && state2.selection.empty && $pos.parentOffset && !$pos.textOffset && $pos.nodeBefore.marks.length) {
          var sel = view2.root.getSelection();
          for (var node4 = sel.focusNode, offset2 = sel.focusOffset; node4 && node4.nodeType == 1 && offset2 != 0; ) {
            var before2 = offset2 < 0 ? node4.lastChild : node4.childNodes[offset2 - 1];
            if (!before2) {
              break;
            }
            if (before2.nodeType == 3) {
              sel.collapse(before2, before2.nodeValue.length);
              break;
            } else {
              node4 = before2;
              offset2 = -1;
            }
          }
        }
      }
      view2.composing = true;
    }
    scheduleComposeEnd(view2, timeoutComposition);
  };
  editHandlers.compositionend = function(view2, event) {
    if (view2.composing) {
      view2.composing = false;
      view2.compositionEndedAt = event.timeStamp;
      scheduleComposeEnd(view2, 20);
    }
  };
  function scheduleComposeEnd(view2, delay) {
    clearTimeout(view2.composingTimeout);
    if (delay > -1) {
      view2.composingTimeout = setTimeout(function() {
        return endComposition(view2);
      }, delay);
    }
  }
  function clearComposition(view2) {
    if (view2.composing) {
      view2.composing = false;
      view2.compositionEndedAt = timestampFromCustomEvent();
    }
    while (view2.compositionNodes.length > 0) {
      view2.compositionNodes.pop().markParentsDirty();
    }
  }
  function timestampFromCustomEvent() {
    var event = document.createEvent("Event");
    event.initEvent("event", true, true);
    return event.timeStamp;
  }
  function endComposition(view2, forceUpdate) {
    view2.domObserver.forceFlush();
    clearComposition(view2);
    if (forceUpdate || view2.docView.dirty) {
      var sel = selectionFromDOM(view2);
      if (sel && !sel.eq(view2.state.selection)) {
        view2.dispatch(view2.state.tr.setSelection(sel));
      } else {
        view2.updateState(view2.state);
      }
      return true;
    }
    return false;
  }
  function captureCopy(view2, dom) {
    if (!view2.dom.parentNode) {
      return;
    }
    var wrap = view2.dom.parentNode.appendChild(document.createElement("div"));
    wrap.appendChild(dom);
    wrap.style.cssText = "position: fixed; left: -10000px; top: 10px";
    var sel = getSelection(), range = document.createRange();
    range.selectNodeContents(dom);
    view2.dom.blur();
    sel.removeAllRanges();
    sel.addRange(range);
    setTimeout(function() {
      if (wrap.parentNode) {
        wrap.parentNode.removeChild(wrap);
      }
      view2.focus();
    }, 50);
  }
  var brokenClipboardAPI = result.ie && result.ie_version < 15 || result.ios && result.webkit_version < 604;
  handlers.copy = editHandlers.cut = function(view2, e) {
    var sel = view2.state.selection, cut3 = e.type == "cut";
    if (sel.empty) {
      return;
    }
    var data = brokenClipboardAPI ? null : e.clipboardData;
    var slice4 = sel.content();
    var ref = serializeForClipboard(view2, slice4);
    var dom = ref.dom;
    var text2 = ref.text;
    if (data) {
      e.preventDefault();
      data.clearData();
      data.setData("text/html", dom.innerHTML);
      data.setData("text/plain", text2);
    } else {
      captureCopy(view2, dom);
    }
    if (cut3) {
      view2.dispatch(view2.state.tr.deleteSelection().scrollIntoView().setMeta("uiEvent", "cut"));
    }
  };
  function sliceSingleNode(slice4) {
    return slice4.openStart == 0 && slice4.openEnd == 0 && slice4.content.childCount == 1 ? slice4.content.firstChild : null;
  }
  function capturePaste(view2, e) {
    if (!view2.dom.parentNode) {
      return;
    }
    var plainText = view2.shiftKey || view2.state.selection.$from.parent.type.spec.code;
    var target = view2.dom.parentNode.appendChild(document.createElement(plainText ? "textarea" : "div"));
    if (!plainText) {
      target.contentEditable = "true";
    }
    target.style.cssText = "position: fixed; left: -10000px; top: 10px";
    target.focus();
    setTimeout(function() {
      view2.focus();
      if (target.parentNode) {
        target.parentNode.removeChild(target);
      }
      if (plainText) {
        doPaste(view2, target.value, null, e);
      } else {
        doPaste(view2, target.textContent, target.innerHTML, e);
      }
    }, 50);
  }
  function doPaste(view2, text2, html, e) {
    var slice4 = parseFromClipboard(view2, text2, html, view2.shiftKey, view2.state.selection.$from);
    if (view2.someProp("handlePaste", function(f) {
      return f(view2, e, slice4 || Slice.empty);
    })) {
      return true;
    }
    if (!slice4) {
      return false;
    }
    var singleNode = sliceSingleNode(slice4);
    var tr = singleNode ? view2.state.tr.replaceSelectionWith(singleNode, view2.shiftKey) : view2.state.tr.replaceSelection(slice4);
    view2.dispatch(tr.scrollIntoView().setMeta("paste", true).setMeta("uiEvent", "paste"));
    return true;
  }
  editHandlers.paste = function(view2, e) {
    var data = brokenClipboardAPI ? null : e.clipboardData;
    if (data && doPaste(view2, data.getData("text/plain"), data.getData("text/html"), e)) {
      e.preventDefault();
    } else {
      capturePaste(view2, e);
    }
  };
  var Dragging = function Dragging2(slice4, move2) {
    this.slice = slice4;
    this.move = move2;
  };
  var dragCopyModifier = result.mac ? "altKey" : "ctrlKey";
  handlers.dragstart = function(view2, e) {
    var mouseDown = view2.mouseDown;
    if (mouseDown) {
      mouseDown.done();
    }
    if (!e.dataTransfer) {
      return;
    }
    var sel = view2.state.selection;
    var pos = sel.empty ? null : view2.posAtCoords(eventCoords(e));
    if (pos && pos.pos >= sel.from && pos.pos <= (sel instanceof NodeSelection ? sel.to - 1 : sel.to))
      ;
    else if (mouseDown && mouseDown.mightDrag) {
      view2.dispatch(view2.state.tr.setSelection(NodeSelection.create(view2.state.doc, mouseDown.mightDrag.pos)));
    } else if (e.target && e.target.nodeType == 1) {
      var desc = view2.docView.nearestDesc(e.target, true);
      if (desc && desc.node.type.spec.draggable && desc != view2.docView) {
        view2.dispatch(view2.state.tr.setSelection(NodeSelection.create(view2.state.doc, desc.posBefore)));
      }
    }
    var slice4 = view2.state.selection.content();
    var ref = serializeForClipboard(view2, slice4);
    var dom = ref.dom;
    var text2 = ref.text;
    e.dataTransfer.clearData();
    e.dataTransfer.setData(brokenClipboardAPI ? "Text" : "text/html", dom.innerHTML);
    e.dataTransfer.effectAllowed = "copyMove";
    if (!brokenClipboardAPI) {
      e.dataTransfer.setData("text/plain", text2);
    }
    view2.dragging = new Dragging(slice4, !e[dragCopyModifier]);
  };
  handlers.dragend = function(view2) {
    var dragging = view2.dragging;
    window.setTimeout(function() {
      if (view2.dragging == dragging) {
        view2.dragging = null;
      }
    }, 50);
  };
  editHandlers.dragover = editHandlers.dragenter = function(_, e) {
    return e.preventDefault();
  };
  editHandlers.drop = function(view2, e) {
    var dragging = view2.dragging;
    view2.dragging = null;
    if (!e.dataTransfer) {
      return;
    }
    var eventPos = view2.posAtCoords(eventCoords(e));
    if (!eventPos) {
      return;
    }
    var $mouse = view2.state.doc.resolve(eventPos.pos);
    if (!$mouse) {
      return;
    }
    var slice4 = dragging && dragging.slice;
    if (slice4) {
      view2.someProp("transformPasted", function(f) {
        slice4 = f(slice4);
      });
    } else {
      slice4 = parseFromClipboard(view2, e.dataTransfer.getData(brokenClipboardAPI ? "Text" : "text/plain"), brokenClipboardAPI ? null : e.dataTransfer.getData("text/html"), false, $mouse);
    }
    var move2 = dragging && !e[dragCopyModifier];
    if (view2.someProp("handleDrop", function(f) {
      return f(view2, e, slice4 || Slice.empty, move2);
    })) {
      e.preventDefault();
      return;
    }
    if (!slice4) {
      return;
    }
    e.preventDefault();
    var insertPos = slice4 ? dropPoint(view2.state.doc, $mouse.pos, slice4) : $mouse.pos;
    if (insertPos == null) {
      insertPos = $mouse.pos;
    }
    var tr = view2.state.tr;
    if (move2) {
      tr.deleteSelection();
    }
    var pos = tr.mapping.map(insertPos);
    var isNode = slice4.openStart == 0 && slice4.openEnd == 0 && slice4.content.childCount == 1;
    var beforeInsert = tr.doc;
    if (isNode) {
      tr.replaceRangeWith(pos, pos, slice4.content.firstChild);
    } else {
      tr.replaceRange(pos, pos, slice4);
    }
    if (tr.doc.eq(beforeInsert)) {
      return;
    }
    var $pos = tr.doc.resolve(pos);
    if (isNode && NodeSelection.isSelectable(slice4.content.firstChild) && $pos.nodeAfter && $pos.nodeAfter.sameMarkup(slice4.content.firstChild)) {
      tr.setSelection(new NodeSelection($pos));
    } else {
      var end2 = tr.mapping.map(insertPos);
      tr.mapping.maps[tr.mapping.maps.length - 1].forEach(function(_from, _to, _newFrom, newTo) {
        return end2 = newTo;
      });
      tr.setSelection(selectionBetween(view2, $pos, tr.doc.resolve(end2)));
    }
    view2.focus();
    view2.dispatch(tr.setMeta("uiEvent", "drop"));
  };
  handlers.focus = function(view2) {
    if (!view2.focused) {
      view2.domObserver.stop();
      view2.dom.classList.add("ProseMirror-focused");
      view2.domObserver.start();
      view2.focused = true;
      setTimeout(function() {
        if (view2.docView && view2.hasFocus() && !view2.domObserver.currentSelection.eq(view2.root.getSelection())) {
          selectionToDOM(view2);
        }
      }, 20);
    }
  };
  handlers.blur = function(view2, e) {
    if (view2.focused) {
      view2.domObserver.stop();
      view2.dom.classList.remove("ProseMirror-focused");
      view2.domObserver.start();
      if (e.relatedTarget && view2.dom.contains(e.relatedTarget)) {
        view2.domObserver.currentSelection.set({});
      }
      view2.focused = false;
    }
  };
  handlers.beforeinput = function(view2, event) {
    if (result.chrome && result.android && event.inputType == "deleteContentBackward") {
      var domChangeCount = view2.domChangeCount;
      setTimeout(function() {
        if (view2.domChangeCount != domChangeCount) {
          return;
        }
        view2.dom.blur();
        view2.focus();
        if (view2.someProp("handleKeyDown", function(f) {
          return f(view2, keyEvent(8, "Backspace"));
        })) {
          return;
        }
        var ref = view2.state.selection;
        var $cursor = ref.$cursor;
        if ($cursor && $cursor.pos > 0) {
          view2.dispatch(view2.state.tr.delete($cursor.pos - 1, $cursor.pos).scrollIntoView());
        }
      }, 50);
    }
  };
  for (var prop in editHandlers) {
    handlers[prop] = editHandlers[prop];
  }
  function compareObjs(a, b) {
    if (a == b) {
      return true;
    }
    for (var p in a) {
      if (a[p] !== b[p]) {
        return false;
      }
    }
    for (var p$1 in b) {
      if (!(p$1 in a)) {
        return false;
      }
    }
    return true;
  }
  var WidgetType = function WidgetType2(toDOM, spec) {
    this.spec = spec || noSpec;
    this.side = this.spec.side || 0;
    this.toDOM = toDOM;
  };
  WidgetType.prototype.map = function map8(mapping, span, offset2, oldOffset) {
    var ref = mapping.mapResult(span.from + oldOffset, this.side < 0 ? -1 : 1);
    var pos = ref.pos;
    var deleted = ref.deleted;
    return deleted ? null : new Decoration(pos - offset2, pos - offset2, this);
  };
  WidgetType.prototype.valid = function valid() {
    return true;
  };
  WidgetType.prototype.eq = function eq6(other) {
    return this == other || other instanceof WidgetType && (this.spec.key && this.spec.key == other.spec.key || this.toDOM == other.toDOM && compareObjs(this.spec, other.spec));
  };
  WidgetType.prototype.destroy = function destroy2(node4) {
    if (this.spec.destroy) {
      this.spec.destroy(node4);
    }
  };
  var InlineType = function InlineType2(attrs, spec) {
    this.spec = spec || noSpec;
    this.attrs = attrs;
  };
  InlineType.prototype.map = function map9(mapping, span, offset2, oldOffset) {
    var from4 = mapping.map(span.from + oldOffset, this.spec.inclusiveStart ? -1 : 1) - offset2;
    var to = mapping.map(span.to + oldOffset, this.spec.inclusiveEnd ? 1 : -1) - offset2;
    return from4 >= to ? null : new Decoration(from4, to, this);
  };
  InlineType.prototype.valid = function valid2(_, span) {
    return span.from < span.to;
  };
  InlineType.prototype.eq = function eq7(other) {
    return this == other || other instanceof InlineType && compareObjs(this.attrs, other.attrs) && compareObjs(this.spec, other.spec);
  };
  InlineType.is = function is(span) {
    return span.type instanceof InlineType;
  };
  var NodeType3 = function NodeType4(attrs, spec) {
    this.spec = spec || noSpec;
    this.attrs = attrs;
  };
  NodeType3.prototype.map = function map10(mapping, span, offset2, oldOffset) {
    var from4 = mapping.mapResult(span.from + oldOffset, 1);
    if (from4.deleted) {
      return null;
    }
    var to = mapping.mapResult(span.to + oldOffset, -1);
    if (to.deleted || to.pos <= from4.pos) {
      return null;
    }
    return new Decoration(from4.pos - offset2, to.pos - offset2, this);
  };
  NodeType3.prototype.valid = function valid3(node4, span) {
    var ref = node4.content.findIndex(span.from);
    var index2 = ref.index;
    var offset2 = ref.offset;
    var child3;
    return offset2 == span.from && !(child3 = node4.child(index2)).isText && offset2 + child3.nodeSize == span.to;
  };
  NodeType3.prototype.eq = function eq8(other) {
    return this == other || other instanceof NodeType3 && compareObjs(this.attrs, other.attrs) && compareObjs(this.spec, other.spec);
  };
  var Decoration = function Decoration2(from4, to, type) {
    this.from = from4;
    this.to = to;
    this.type = type;
  };
  var prototypeAccessors$14 = {spec: {configurable: true}, inline: {configurable: true}};
  Decoration.prototype.copy = function copy4(from4, to) {
    return new Decoration(from4, to, this.type);
  };
  Decoration.prototype.eq = function eq9(other, offset2) {
    if (offset2 === void 0)
      offset2 = 0;
    return this.type.eq(other.type) && this.from + offset2 == other.from && this.to + offset2 == other.to;
  };
  Decoration.prototype.map = function map11(mapping, offset2, oldOffset) {
    return this.type.map(mapping, this, offset2, oldOffset);
  };
  Decoration.widget = function widget(pos, toDOM, spec) {
    return new Decoration(pos, pos, new WidgetType(toDOM, spec));
  };
  Decoration.inline = function inline(from4, to, attrs, spec) {
    return new Decoration(from4, to, new InlineType(attrs, spec));
  };
  Decoration.node = function node3(from4, to, attrs, spec) {
    return new Decoration(from4, to, new NodeType3(attrs, spec));
  };
  prototypeAccessors$14.spec.get = function() {
    return this.type.spec;
  };
  prototypeAccessors$14.inline.get = function() {
    return this.type instanceof InlineType;
  };
  Object.defineProperties(Decoration.prototype, prototypeAccessors$14);
  var none = [];
  var noSpec = {};
  var DecorationSet = function DecorationSet2(local, children) {
    this.local = local && local.length ? local : none;
    this.children = children && children.length ? children : none;
  };
  DecorationSet.create = function create4(doc2, decorations) {
    return decorations.length ? buildTree(decorations, doc2, 0, noSpec) : empty;
  };
  DecorationSet.prototype.find = function find(start3, end2, predicate) {
    var result2 = [];
    this.findInner(start3 == null ? 0 : start3, end2 == null ? 1e9 : end2, result2, 0, predicate);
    return result2;
  };
  DecorationSet.prototype.findInner = function findInner(start3, end2, result2, offset2, predicate) {
    for (var i = 0; i < this.local.length; i++) {
      var span = this.local[i];
      if (span.from <= end2 && span.to >= start3 && (!predicate || predicate(span.spec))) {
        result2.push(span.copy(span.from + offset2, span.to + offset2));
      }
    }
    for (var i$1 = 0; i$1 < this.children.length; i$1 += 3) {
      if (this.children[i$1] < end2 && this.children[i$1 + 1] > start3) {
        var childOff = this.children[i$1] + 1;
        this.children[i$1 + 2].findInner(start3 - childOff, end2 - childOff, result2, offset2 + childOff, predicate);
      }
    }
  };
  DecorationSet.prototype.map = function map12(mapping, doc2, options) {
    if (this == empty || mapping.maps.length == 0) {
      return this;
    }
    return this.mapInner(mapping, doc2, 0, 0, options || noSpec);
  };
  DecorationSet.prototype.mapInner = function mapInner(mapping, node4, offset2, oldOffset, options) {
    var newLocal;
    for (var i = 0; i < this.local.length; i++) {
      var mapped = this.local[i].map(mapping, offset2, oldOffset);
      if (mapped && mapped.type.valid(node4, mapped)) {
        (newLocal || (newLocal = [])).push(mapped);
      } else if (options.onRemove) {
        options.onRemove(this.local[i].spec);
      }
    }
    if (this.children.length) {
      return mapChildren(this.children, newLocal, mapping, node4, offset2, oldOffset, options);
    } else {
      return newLocal ? new DecorationSet(newLocal.sort(byPos)) : empty;
    }
  };
  DecorationSet.prototype.add = function add(doc2, decorations) {
    if (!decorations.length) {
      return this;
    }
    if (this == empty) {
      return DecorationSet.create(doc2, decorations);
    }
    return this.addInner(doc2, decorations, 0);
  };
  DecorationSet.prototype.addInner = function addInner(doc2, decorations, offset2) {
    var this$1 = this;
    var children, childIndex = 0;
    doc2.forEach(function(childNode, childOffset) {
      var baseOffset = childOffset + offset2, found2;
      if (!(found2 = takeSpansForNode(decorations, childNode, baseOffset))) {
        return;
      }
      if (!children) {
        children = this$1.children.slice();
      }
      while (childIndex < children.length && children[childIndex] < childOffset) {
        childIndex += 3;
      }
      if (children[childIndex] == childOffset) {
        children[childIndex + 2] = children[childIndex + 2].addInner(childNode, found2, baseOffset + 1);
      } else {
        children.splice(childIndex, 0, childOffset, childOffset + childNode.nodeSize, buildTree(found2, childNode, baseOffset + 1, noSpec));
      }
      childIndex += 3;
    });
    var local = moveSpans(childIndex ? withoutNulls(decorations) : decorations, -offset2);
    for (var i = 0; i < local.length; i++) {
      if (!local[i].type.valid(doc2, local[i])) {
        local.splice(i--, 1);
      }
    }
    return new DecorationSet(local.length ? this.local.concat(local).sort(byPos) : this.local, children || this.children);
  };
  DecorationSet.prototype.remove = function remove(decorations) {
    if (decorations.length == 0 || this == empty) {
      return this;
    }
    return this.removeInner(decorations, 0);
  };
  DecorationSet.prototype.removeInner = function removeInner(decorations, offset2) {
    var children = this.children, local = this.local;
    for (var i = 0; i < children.length; i += 3) {
      var found2 = void 0, from4 = children[i] + offset2, to = children[i + 1] + offset2;
      for (var j = 0, span = void 0; j < decorations.length; j++) {
        if (span = decorations[j]) {
          if (span.from > from4 && span.to < to) {
            decorations[j] = null;
            (found2 || (found2 = [])).push(span);
          }
        }
      }
      if (!found2) {
        continue;
      }
      if (children == this.children) {
        children = this.children.slice();
      }
      var removed = children[i + 2].removeInner(found2, from4 + 1);
      if (removed != empty) {
        children[i + 2] = removed;
      } else {
        children.splice(i, 3);
        i -= 3;
      }
    }
    if (local.length) {
      for (var i$1 = 0, span$1 = void 0; i$1 < decorations.length; i$1++) {
        if (span$1 = decorations[i$1]) {
          for (var j$1 = 0; j$1 < local.length; j$1++) {
            if (local[j$1].eq(span$1, offset2)) {
              if (local == this.local) {
                local = this.local.slice();
              }
              local.splice(j$1--, 1);
            }
          }
        }
      }
    }
    if (children == this.children && local == this.local) {
      return this;
    }
    return local.length || children.length ? new DecorationSet(local, children) : empty;
  };
  DecorationSet.prototype.forChild = function forChild(offset2, node4) {
    if (this == empty) {
      return this;
    }
    if (node4.isLeaf) {
      return DecorationSet.empty;
    }
    var child3, local;
    for (var i = 0; i < this.children.length; i += 3) {
      if (this.children[i] >= offset2) {
        if (this.children[i] == offset2) {
          child3 = this.children[i + 2];
        }
        break;
      }
    }
    var start3 = offset2 + 1, end2 = start3 + node4.content.size;
    for (var i$1 = 0; i$1 < this.local.length; i$1++) {
      var dec = this.local[i$1];
      if (dec.from < end2 && dec.to > start3 && dec.type instanceof InlineType) {
        var from4 = Math.max(start3, dec.from) - start3, to = Math.min(end2, dec.to) - start3;
        if (from4 < to) {
          (local || (local = [])).push(dec.copy(from4, to));
        }
      }
    }
    if (local) {
      var localSet = new DecorationSet(local.sort(byPos));
      return child3 ? new DecorationGroup([localSet, child3]) : localSet;
    }
    return child3 || empty;
  };
  DecorationSet.prototype.eq = function eq10(other) {
    if (this == other) {
      return true;
    }
    if (!(other instanceof DecorationSet) || this.local.length != other.local.length || this.children.length != other.children.length) {
      return false;
    }
    for (var i = 0; i < this.local.length; i++) {
      if (!this.local[i].eq(other.local[i])) {
        return false;
      }
    }
    for (var i$1 = 0; i$1 < this.children.length; i$1 += 3) {
      if (this.children[i$1] != other.children[i$1] || this.children[i$1 + 1] != other.children[i$1 + 1] || !this.children[i$1 + 2].eq(other.children[i$1 + 2])) {
        return false;
      }
    }
    return true;
  };
  DecorationSet.prototype.locals = function locals(node4) {
    return removeOverlap(this.localsInner(node4));
  };
  DecorationSet.prototype.localsInner = function localsInner(node4) {
    if (this == empty) {
      return none;
    }
    if (node4.inlineContent || !this.local.some(InlineType.is)) {
      return this.local;
    }
    var result2 = [];
    for (var i = 0; i < this.local.length; i++) {
      if (!(this.local[i].type instanceof InlineType)) {
        result2.push(this.local[i]);
      }
    }
    return result2;
  };
  var empty = new DecorationSet();
  DecorationSet.empty = empty;
  DecorationSet.removeOverlap = removeOverlap;
  var DecorationGroup = function DecorationGroup2(members) {
    this.members = members;
  };
  DecorationGroup.prototype.map = function map13(mapping, doc2) {
    var mappedDecos = this.members.map(function(member) {
      return member.map(mapping, doc2, noSpec);
    });
    return DecorationGroup.from(mappedDecos);
  };
  DecorationGroup.prototype.forChild = function forChild2(offset2, child3) {
    if (child3.isLeaf) {
      return DecorationSet.empty;
    }
    var found2 = [];
    for (var i = 0; i < this.members.length; i++) {
      var result2 = this.members[i].forChild(offset2, child3);
      if (result2 == empty) {
        continue;
      }
      if (result2 instanceof DecorationGroup) {
        found2 = found2.concat(result2.members);
      } else {
        found2.push(result2);
      }
    }
    return DecorationGroup.from(found2);
  };
  DecorationGroup.prototype.eq = function eq11(other) {
    if (!(other instanceof DecorationGroup) || other.members.length != this.members.length) {
      return false;
    }
    for (var i = 0; i < this.members.length; i++) {
      if (!this.members[i].eq(other.members[i])) {
        return false;
      }
    }
    return true;
  };
  DecorationGroup.prototype.locals = function locals2(node4) {
    var result2, sorted = true;
    for (var i = 0; i < this.members.length; i++) {
      var locals3 = this.members[i].localsInner(node4);
      if (!locals3.length) {
        continue;
      }
      if (!result2) {
        result2 = locals3;
      } else {
        if (sorted) {
          result2 = result2.slice();
          sorted = false;
        }
        for (var j = 0; j < locals3.length; j++) {
          result2.push(locals3[j]);
        }
      }
    }
    return result2 ? removeOverlap(sorted ? result2 : result2.sort(byPos)) : none;
  };
  DecorationGroup.from = function from3(members) {
    switch (members.length) {
      case 0:
        return empty;
      case 1:
        return members[0];
      default:
        return new DecorationGroup(members);
    }
  };
  function mapChildren(oldChildren, newLocal, mapping, node4, offset2, oldOffset, options) {
    var children = oldChildren.slice();
    var shift2 = function(oldStart, oldEnd, newStart, newEnd) {
      for (var i2 = 0; i2 < children.length; i2 += 3) {
        var end2 = children[i2 + 1], dSize = void 0;
        if (end2 == -1 || oldStart > end2 + oldOffset) {
          continue;
        }
        if (oldEnd >= children[i2] + oldOffset) {
          children[i2 + 1] = -1;
        } else if (newStart >= offset2 && (dSize = newEnd - newStart - (oldEnd - oldStart))) {
          children[i2] += dSize;
          children[i2 + 1] += dSize;
        }
      }
    };
    for (var i = 0; i < mapping.maps.length; i++) {
      mapping.maps[i].forEach(shift2);
    }
    var mustRebuild = false;
    for (var i$1 = 0; i$1 < children.length; i$1 += 3) {
      if (children[i$1 + 1] == -1) {
        var from4 = mapping.map(oldChildren[i$1] + oldOffset), fromLocal = from4 - offset2;
        if (fromLocal < 0 || fromLocal >= node4.content.size) {
          mustRebuild = true;
          continue;
        }
        var to = mapping.map(oldChildren[i$1 + 1] + oldOffset, -1), toLocal = to - offset2;
        var ref = node4.content.findIndex(fromLocal);
        var index2 = ref.index;
        var childOffset = ref.offset;
        var childNode = node4.maybeChild(index2);
        if (childNode && childOffset == fromLocal && childOffset + childNode.nodeSize == toLocal) {
          var mapped = children[i$1 + 2].mapInner(mapping, childNode, from4 + 1, oldChildren[i$1] + oldOffset + 1, options);
          if (mapped != empty) {
            children[i$1] = fromLocal;
            children[i$1 + 1] = toLocal;
            children[i$1 + 2] = mapped;
          } else {
            children[i$1 + 1] = -2;
            mustRebuild = true;
          }
        } else {
          mustRebuild = true;
        }
      }
    }
    if (mustRebuild) {
      var decorations = mapAndGatherRemainingDecorations(children, oldChildren, newLocal || [], mapping, offset2, oldOffset, options);
      var built = buildTree(decorations, node4, 0, options);
      newLocal = built.local;
      for (var i$2 = 0; i$2 < children.length; i$2 += 3) {
        if (children[i$2 + 1] < 0) {
          children.splice(i$2, 3);
          i$2 -= 3;
        }
      }
      for (var i$3 = 0, j = 0; i$3 < built.children.length; i$3 += 3) {
        var from$1 = built.children[i$3];
        while (j < children.length && children[j] < from$1) {
          j += 3;
        }
        children.splice(j, 0, built.children[i$3], built.children[i$3 + 1], built.children[i$3 + 2]);
      }
    }
    return new DecorationSet(newLocal && newLocal.sort(byPos), children);
  }
  function moveSpans(spans, offset2) {
    if (!offset2 || !spans.length) {
      return spans;
    }
    var result2 = [];
    for (var i = 0; i < spans.length; i++) {
      var span = spans[i];
      result2.push(new Decoration(span.from + offset2, span.to + offset2, span.type));
    }
    return result2;
  }
  function mapAndGatherRemainingDecorations(children, oldChildren, decorations, mapping, offset2, oldOffset, options) {
    function gather(set2, oldOffset2) {
      for (var i2 = 0; i2 < set2.local.length; i2++) {
        var mapped = set2.local[i2].map(mapping, offset2, oldOffset2);
        if (mapped) {
          decorations.push(mapped);
        } else if (options.onRemove) {
          options.onRemove(set2.local[i2].spec);
        }
      }
      for (var i$1 = 0; i$1 < set2.children.length; i$1 += 3) {
        gather(set2.children[i$1 + 2], set2.children[i$1] + oldOffset2 + 1);
      }
    }
    for (var i = 0; i < children.length; i += 3) {
      if (children[i + 1] == -1) {
        gather(children[i + 2], oldChildren[i] + oldOffset + 1);
      }
    }
    return decorations;
  }
  function takeSpansForNode(spans, node4, offset2) {
    if (node4.isLeaf) {
      return null;
    }
    var end2 = offset2 + node4.nodeSize, found2 = null;
    for (var i = 0, span = void 0; i < spans.length; i++) {
      if ((span = spans[i]) && span.from > offset2 && span.to < end2) {
        (found2 || (found2 = [])).push(span);
        spans[i] = null;
      }
    }
    return found2;
  }
  function withoutNulls(array) {
    var result2 = [];
    for (var i = 0; i < array.length; i++) {
      if (array[i] != null) {
        result2.push(array[i]);
      }
    }
    return result2;
  }
  function buildTree(spans, node4, offset2, options) {
    var children = [], hasNulls = false;
    node4.forEach(function(childNode, localStart) {
      var found2 = takeSpansForNode(spans, childNode, localStart + offset2);
      if (found2) {
        hasNulls = true;
        var subtree = buildTree(found2, childNode, offset2 + localStart + 1, options);
        if (subtree != empty) {
          children.push(localStart, localStart + childNode.nodeSize, subtree);
        }
      }
    });
    var locals3 = moveSpans(hasNulls ? withoutNulls(spans) : spans, -offset2).sort(byPos);
    for (var i = 0; i < locals3.length; i++) {
      if (!locals3[i].type.valid(node4, locals3[i])) {
        if (options.onRemove) {
          options.onRemove(locals3[i].spec);
        }
        locals3.splice(i--, 1);
      }
    }
    return locals3.length || children.length ? new DecorationSet(locals3, children) : empty;
  }
  function byPos(a, b) {
    return a.from - b.from || a.to - b.to;
  }
  function removeOverlap(spans) {
    var working = spans;
    for (var i = 0; i < working.length - 1; i++) {
      var span = working[i];
      if (span.from != span.to) {
        for (var j = i + 1; j < working.length; j++) {
          var next = working[j];
          if (next.from == span.from) {
            if (next.to != span.to) {
              if (working == spans) {
                working = spans.slice();
              }
              working[j] = next.copy(next.from, span.to);
              insertAhead(working, j + 1, next.copy(span.to, next.to));
            }
            continue;
          } else {
            if (next.from < span.to) {
              if (working == spans) {
                working = spans.slice();
              }
              working[i] = span.copy(span.from, next.from);
              insertAhead(working, j, span.copy(next.from, span.to));
            }
            break;
          }
        }
      }
    }
    return working;
  }
  function insertAhead(array, i, deco) {
    while (i < array.length && byPos(deco, array[i]) > 0) {
      i++;
    }
    array.splice(i, 0, deco);
  }
  function viewDecorations(view2) {
    var found2 = [];
    view2.someProp("decorations", function(f) {
      var result2 = f(view2.state);
      if (result2 && result2 != empty) {
        found2.push(result2);
      }
    });
    if (view2.cursorWrapper) {
      found2.push(DecorationSet.create(view2.state.doc, [view2.cursorWrapper.deco]));
    }
    return DecorationGroup.from(found2);
  }
  var EditorView = function EditorView2(place, props) {
    this._props = props;
    this.state = props.state;
    this.directPlugins = props.plugins || [];
    this.directPlugins.forEach(checkStateComponent);
    this.dispatch = this.dispatch.bind(this);
    this._root = null;
    this.focused = false;
    this.trackWrites = null;
    this.dom = place && place.mount || document.createElement("div");
    if (place) {
      if (place.appendChild) {
        place.appendChild(this.dom);
      } else if (place.apply) {
        place(this.dom);
      } else if (place.mount) {
        this.mounted = true;
      }
    }
    this.editable = getEditable(this);
    this.markCursor = null;
    this.cursorWrapper = null;
    updateCursorWrapper(this);
    this.nodeViews = buildNodeViews(this);
    this.docView = docViewDesc(this.state.doc, computeDocDeco(this), viewDecorations(this), this.dom, this);
    this.lastSelectedViewDesc = null;
    this.dragging = null;
    initInput(this);
    this.prevDirectPlugins = [];
    this.pluginViews = [];
    this.updatePluginViews();
  };
  var prototypeAccessors$22 = {props: {configurable: true}, root: {configurable: true}, isDestroyed: {configurable: true}};
  prototypeAccessors$22.props.get = function() {
    if (this._props.state != this.state) {
      var prev = this._props;
      this._props = {};
      for (var name in prev) {
        this._props[name] = prev[name];
      }
      this._props.state = this.state;
    }
    return this._props;
  };
  EditorView.prototype.update = function update(props) {
    if (props.handleDOMEvents != this._props.handleDOMEvents) {
      ensureListeners(this);
    }
    this._props = props;
    if (props.plugins) {
      props.plugins.forEach(checkStateComponent);
      this.directPlugins = props.plugins;
    }
    this.updateStateInner(props.state, true);
  };
  EditorView.prototype.setProps = function setProps(props) {
    var updated = {};
    for (var name in this._props) {
      updated[name] = this._props[name];
    }
    updated.state = this.state;
    for (var name$1 in props) {
      updated[name$1] = props[name$1];
    }
    this.update(updated);
  };
  EditorView.prototype.updateState = function updateState(state2) {
    this.updateStateInner(state2, this.state.plugins != state2.plugins);
  };
  EditorView.prototype.updateStateInner = function updateStateInner(state2, reconfigured) {
    var this$1 = this;
    var prev = this.state, redraw = false, updateSel = false;
    if (state2.storedMarks && this.composing) {
      clearComposition(this);
      updateSel = true;
    }
    this.state = state2;
    if (reconfigured) {
      var nodeViews = buildNodeViews(this);
      if (changedNodeViews(nodeViews, this.nodeViews)) {
        this.nodeViews = nodeViews;
        redraw = true;
      }
      ensureListeners(this);
    }
    this.editable = getEditable(this);
    updateCursorWrapper(this);
    var innerDeco = viewDecorations(this), outerDeco = computeDocDeco(this);
    var scroll = reconfigured ? "reset" : state2.scrollToSelection > prev.scrollToSelection ? "to selection" : "preserve";
    var updateDoc = redraw || !this.docView.matchesNode(state2.doc, outerDeco, innerDeco);
    if (updateDoc || !state2.selection.eq(prev.selection)) {
      updateSel = true;
    }
    var oldScrollPos = scroll == "preserve" && updateSel && this.dom.style.overflowAnchor == null && storeScrollPos(this);
    if (updateSel) {
      this.domObserver.stop();
      var forceSelUpdate = updateDoc && (result.ie || result.chrome) && !this.composing && !prev.selection.empty && !state2.selection.empty && selectionContextChanged(prev.selection, state2.selection);
      if (updateDoc) {
        var chromeKludge = result.chrome ? this.trackWrites = this.root.getSelection().focusNode : null;
        if (redraw || !this.docView.update(state2.doc, outerDeco, innerDeco, this)) {
          this.docView.updateOuterDeco([]);
          this.docView.destroy();
          this.docView = docViewDesc(state2.doc, outerDeco, innerDeco, this.dom, this);
        }
        if (chromeKludge && !this.trackWrites) {
          forceSelUpdate = true;
        }
      }
      if (forceSelUpdate || !(this.mouseDown && this.domObserver.currentSelection.eq(this.root.getSelection()) && anchorInRightPlace(this))) {
        selectionToDOM(this, forceSelUpdate);
      } else {
        syncNodeSelection(this, state2.selection);
        this.domObserver.setCurSelection();
      }
      this.domObserver.start();
    }
    this.updatePluginViews(prev);
    if (scroll == "reset") {
      this.dom.scrollTop = 0;
    } else if (scroll == "to selection") {
      var startDOM = this.root.getSelection().focusNode;
      if (this.someProp("handleScrollToSelection", function(f) {
        return f(this$1);
      }))
        ;
      else if (state2.selection instanceof NodeSelection) {
        scrollRectIntoView(this, this.docView.domAfterPos(state2.selection.from).getBoundingClientRect(), startDOM);
      } else {
        scrollRectIntoView(this, this.coordsAtPos(state2.selection.head, 1), startDOM);
      }
    } else if (oldScrollPos) {
      resetScrollPos(oldScrollPos);
    }
  };
  EditorView.prototype.destroyPluginViews = function destroyPluginViews() {
    var view2;
    while (view2 = this.pluginViews.pop()) {
      if (view2.destroy) {
        view2.destroy();
      }
    }
  };
  EditorView.prototype.updatePluginViews = function updatePluginViews(prevState) {
    if (!prevState || prevState.plugins != this.state.plugins || this.directPlugins != this.prevDirectPlugins) {
      this.prevDirectPlugins = this.directPlugins;
      this.destroyPluginViews();
      for (var i = 0; i < this.directPlugins.length; i++) {
        var plugin = this.directPlugins[i];
        if (plugin.spec.view) {
          this.pluginViews.push(plugin.spec.view(this));
        }
      }
      for (var i$1 = 0; i$1 < this.state.plugins.length; i$1++) {
        var plugin$1 = this.state.plugins[i$1];
        if (plugin$1.spec.view) {
          this.pluginViews.push(plugin$1.spec.view(this));
        }
      }
    } else {
      for (var i$2 = 0; i$2 < this.pluginViews.length; i$2++) {
        var pluginView = this.pluginViews[i$2];
        if (pluginView.update) {
          pluginView.update(this, prevState);
        }
      }
    }
  };
  EditorView.prototype.someProp = function someProp(propName, f) {
    var prop = this._props && this._props[propName], value;
    if (prop != null && (value = f ? f(prop) : prop)) {
      return value;
    }
    for (var i = 0; i < this.directPlugins.length; i++) {
      var prop$1 = this.directPlugins[i].props[propName];
      if (prop$1 != null && (value = f ? f(prop$1) : prop$1)) {
        return value;
      }
    }
    var plugins = this.state.plugins;
    if (plugins) {
      for (var i$1 = 0; i$1 < plugins.length; i$1++) {
        var prop$2 = plugins[i$1].props[propName];
        if (prop$2 != null && (value = f ? f(prop$2) : prop$2)) {
          return value;
        }
      }
    }
  };
  EditorView.prototype.hasFocus = function hasFocus() {
    return this.root.activeElement == this.dom;
  };
  EditorView.prototype.focus = function focus() {
    this.domObserver.stop();
    if (this.editable) {
      focusPreventScroll(this.dom);
    }
    selectionToDOM(this);
    this.domObserver.start();
  };
  prototypeAccessors$22.root.get = function() {
    var cached = this._root;
    if (cached == null) {
      for (var search = this.dom.parentNode; search; search = search.parentNode) {
        if (search.nodeType == 9 || search.nodeType == 11 && search.host) {
          if (!search.getSelection) {
            Object.getPrototypeOf(search).getSelection = function() {
              return document.getSelection();
            };
          }
          return this._root = search;
        }
      }
    }
    return cached || document;
  };
  EditorView.prototype.posAtCoords = function posAtCoords$1(coords) {
    return posAtCoords(this, coords);
  };
  EditorView.prototype.coordsAtPos = function coordsAtPos$1(pos, side) {
    if (side === void 0)
      side = 1;
    return coordsAtPos(this, pos, side);
  };
  EditorView.prototype.domAtPos = function domAtPos(pos, side) {
    if (side === void 0)
      side = 0;
    return this.docView.domFromPos(pos, side);
  };
  EditorView.prototype.nodeDOM = function nodeDOM(pos) {
    var desc = this.docView.descAt(pos);
    return desc ? desc.nodeDOM : null;
  };
  EditorView.prototype.posAtDOM = function posAtDOM(node4, offset2, bias) {
    if (bias === void 0)
      bias = -1;
    var pos = this.docView.posFromDOM(node4, offset2, bias);
    if (pos == null) {
      throw new RangeError("DOM position not inside the editor");
    }
    return pos;
  };
  EditorView.prototype.endOfTextblock = function endOfTextblock$1(dir, state2) {
    return endOfTextblock(this, state2 || this.state, dir);
  };
  EditorView.prototype.destroy = function destroy3() {
    if (!this.docView) {
      return;
    }
    destroyInput(this);
    this.destroyPluginViews();
    if (this.mounted) {
      this.docView.update(this.state.doc, [], viewDecorations(this), this);
      this.dom.textContent = "";
    } else if (this.dom.parentNode) {
      this.dom.parentNode.removeChild(this.dom);
    }
    this.docView.destroy();
    this.docView = null;
  };
  prototypeAccessors$22.isDestroyed.get = function() {
    return this.docView == null;
  };
  EditorView.prototype.dispatchEvent = function dispatchEvent$1(event) {
    return dispatchEvent(this, event);
  };
  EditorView.prototype.dispatch = function dispatch(tr) {
    var dispatchTransaction = this._props.dispatchTransaction;
    if (dispatchTransaction) {
      dispatchTransaction.call(this, tr);
    } else {
      this.updateState(this.state.apply(tr));
    }
  };
  Object.defineProperties(EditorView.prototype, prototypeAccessors$22);
  function computeDocDeco(view2) {
    var attrs = Object.create(null);
    attrs.class = "ProseMirror";
    attrs.contenteditable = String(view2.editable);
    attrs.translate = "no";
    view2.someProp("attributes", function(value) {
      if (typeof value == "function") {
        value = value(view2.state);
      }
      if (value) {
        for (var attr in value) {
          if (attr == "class") {
            attrs.class += " " + value[attr];
          }
          if (attr == "style") {
            attrs.style = (attrs.style ? attrs.style + ";" : "") + value[attr];
          } else if (!attrs[attr] && attr != "contenteditable" && attr != "nodeName") {
            attrs[attr] = String(value[attr]);
          }
        }
      }
    });
    return [Decoration.node(0, view2.state.doc.content.size, attrs)];
  }
  function updateCursorWrapper(view2) {
    if (view2.markCursor) {
      var dom = document.createElement("img");
      dom.className = "ProseMirror-separator";
      dom.setAttribute("mark-placeholder", "true");
      view2.cursorWrapper = {dom, deco: Decoration.widget(view2.state.selection.head, dom, {raw: true, marks: view2.markCursor})};
    } else {
      view2.cursorWrapper = null;
    }
  }
  function getEditable(view2) {
    return !view2.someProp("editable", function(value) {
      return value(view2.state) === false;
    });
  }
  function selectionContextChanged(sel1, sel2) {
    var depth = Math.min(sel1.$anchor.sharedDepth(sel1.head), sel2.$anchor.sharedDepth(sel2.head));
    return sel1.$anchor.start(depth) != sel2.$anchor.start(depth);
  }
  function buildNodeViews(view2) {
    var result2 = {};
    view2.someProp("nodeViews", function(obj) {
      for (var prop in obj) {
        if (!Object.prototype.hasOwnProperty.call(result2, prop)) {
          result2[prop] = obj[prop];
        }
      }
    });
    return result2;
  }
  function changedNodeViews(a, b) {
    var nA = 0, nB = 0;
    for (var prop in a) {
      if (a[prop] != b[prop]) {
        return true;
      }
      nA++;
    }
    for (var _ in b) {
      nB++;
    }
    return nA != nB;
  }
  function checkStateComponent(plugin) {
    if (plugin.spec.state || plugin.spec.filterTransaction || plugin.spec.appendTransaction) {
      throw new RangeError("Plugins passed directly to the view must not have a state component");
    }
  }

  // src/CursorPlugin.ts
  var Cursor = class {
    #selectionType;
    #anchorEl;
    #headEl;
    #cursorTimeout = 1e4;
    #cursorTimeoutFn = 0;
    constructor() {
      this.#anchorEl = document.createElement("div");
      this.#anchorEl.classList.add("cursor", "anchor");
      this.#headEl = document.createElement("div");
      this.#headEl.classList.add("cursor", "head");
      this.#selectionType = "cursor";
      main.appendChild(this.#anchorEl);
      main.appendChild(this.#headEl);
    }
    activate() {
      this.#headEl.classList.remove("inactive");
      this.#anchorEl.classList.remove("inactive");
      return this;
    }
    deactivate() {
      this.#headEl.classList.add("inactive");
      this.#anchorEl.classList.add("inactive");
      return this;
    }
    resetTimeout() {
      this.activate();
      clearTimeout(this.#cursorTimeoutFn);
      this.#cursorTimeoutFn = setTimeout(() => this.deactivate(), this.#cursorTimeout);
      return this;
    }
    repositionAnchor(x, y) {
      this.#anchorEl.style.transform = `translate(${x - 2}px, ${window.scrollY + y - 2}px)`;
      return this;
    }
    repositionHead(x, y) {
      this.#headEl.style.transform = `translate(${x - 2}px, ${window.scrollY + y - 2}px)`;
      return this;
    }
    repositionToCoords(x, y) {
      return this.repositionAnchor(x, y).repositionHead(x, y);
    }
    reposition(view2) {
      const isCursorSelection = view2.state.selection.head === view2.state.selection.anchor;
      if (isCursorSelection) {
        const anchorPosition = Math.max(view2.state.selection.anchor, 1);
        const anchorCoords = view2.coordsAtPos(anchorPosition);
        this.repositionToCoords(anchorCoords.right, anchorCoords.top);
        if (this.#selectionType === "text") {
          this.#anchorEl.classList.remove("split");
          this.#headEl.classList.remove("split");
          this.#selectionType = "cursor";
        }
      } else {
        if (this.#selectionType === "cursor") {
          this.#anchorEl.classList.add("split");
          this.#headEl.classList.add("split");
          this.#selectionType = "text";
        }
        const anchorPosition = Math.max(view2.state.selection.anchor, 1);
        const headPosition = Math.min(view2.state.selection.head, view2.state.doc.nodeSize - 3);
        if (anchorPosition > headPosition) {
          this.#anchorEl.classList.add("right");
          this.#headEl.classList.remove("right");
          this.#anchorEl.classList.remove("left");
          this.#headEl.classList.add("left");
        } else {
          this.#anchorEl.classList.add("left");
          this.#headEl.classList.remove("left");
          this.#anchorEl.classList.remove("right");
          this.#headEl.classList.add("right");
        }
        const anchorCoords = view2.coordsAtPos(anchorPosition);
        this.repositionAnchor(anchorCoords.right, anchorCoords.top);
        const headCoords = view2.coordsAtPos(headPosition);
        this.repositionHead(headCoords.right, headCoords.top);
      }
      return this;
    }
  };
  var CursorPlugin = new Plugin({
    key: new PluginKey("cursor"),
    view: (view2) => {
      const cursor = new Cursor();
      window.addEventListener("resize", () => {
        cursor.reposition(view2);
      });
      view2.root.addEventListener("focus", cursor.resetTimeout, true);
      view2.root.addEventListener("blur", cursor.deactivate, true);
      cursor.reposition(view2);
      return {
        update: (view3) => {
          cursor.resetTimeout();
          cursor.reposition(view3);
        },
        destroy: () => {
          view2.root.removeEventListener("focus", cursor.resetTimeout, true);
          view2.root.removeEventListener("blur", cursor.deactivate, true);
        }
      };
    }
  });

  // src/initial.ts
  var welcomes = [
    "What's on your mind?",
    "Hey, welcome to Gem :)",
    "Hello, hello!",
    "Why, welcome.",
    "A long, long time ago...",
    "Go ahead, try me >:)",
    "Just type it out."
  ];
  var welcomeDoc = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: welcomes[Math.floor(Math.random() * welcomes.length)]
          }
        ]
      }
    ]
  };
  var aboutDoc = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        attrs: {type: "base"},
        content: [
          {
            type: "text",
            text: "Hello! Welcome to Gem. Gem is a light-weight, performant, and minimal editor designed to be aesthetic and fun. "
          }
        ]
      },
      {type: "paragraph", attrs: {type: "base"}},
      {
        type: "paragraph",
        attrs: {type: "base"},
        content: [
          {
            type: "text",
            text: "It's entirely local: your notes don't get sent anywhere, and if you close the tab, they're gone forever."
          }
        ]
      },
      {type: "paragraph", attrs: {type: "base"}},
      {
        type: "paragraph",
        attrs: {type: "base"},
        content: [
          {
            type: "text",
            text: "It currently supports some limited Markdown-like functionality like "
          },
          {type: "text", marks: [{type: "bold"}], text: "*bold*"},
          {type: "text", text: ", "},
          {type: "text", marks: [{type: "italic"}], text: "_italic_,"},
          {type: "text", text: " and "},
          {type: "text", marks: [{type: "code"}], text: "`code`"},
          {
            type: "text",
            text: " although they can be a little buggy. There's plans to add more elements with more robust support."
          }
        ]
      },
      {type: "paragraph", attrs: {type: "base"}},
      {
        type: "paragraph",
        attrs: {type: "base"},
        content: [
          {
            type: "text",
            text: "It's being developed by [Tanishq Kancharla](https://moonrise.tk) (me!) and open-sourced on [Github](https://github.com/moonrise-tk/gem). Have a look at the README for more information."
          }
        ]
      },
      {type: "paragraph", attrs: {type: "base"}},
      {
        type: "paragraph",
        attrs: {type: "base"},
        content: [
          {
            type: "text",
            text: "Please reach out to me if you like Gem, or have any ideas for features!"
          }
        ]
      },
      {type: "paragraph", attrs: {type: "base"}},
      {type: "paragraph", attrs: {type: "base"}}
    ]
  };
  var initalContent = window.location.pathname === "/about" ? aboutDoc : welcomeDoc;

  // node_modules/prosemirror-inputrules/dist/index.es.js
  var InputRule = function InputRule2(match, handler) {
    this.match = match;
    this.handler = typeof handler == "string" ? stringHandler(handler) : handler;
  };
  function stringHandler(string) {
    return function(state2, match, start3, end2) {
      var insert = string;
      if (match[1]) {
        var offset2 = match[0].lastIndexOf(match[1]);
        insert += match[0].slice(offset2 + match[1].length);
        start3 += offset2;
        var cutOff = start3 - end2;
        if (cutOff > 0) {
          insert = match[0].slice(offset2 - cutOff, offset2) + insert;
          start3 = end2;
        }
      }
      return state2.tr.insertText(insert, start3, end2);
    };
  }
  var MAX_MATCH = 500;
  function inputRules(ref) {
    var rules = ref.rules;
    var plugin = new Plugin({
      state: {
        init: function init5() {
          return null;
        },
        apply: function apply8(tr, prev) {
          var stored = tr.getMeta(this);
          if (stored) {
            return stored;
          }
          return tr.selectionSet || tr.docChanged ? null : prev;
        }
      },
      props: {
        handleTextInput: function handleTextInput(view2, from4, to, text2) {
          return run(view2, from4, to, text2, rules, plugin);
        },
        handleDOMEvents: {
          compositionend: function(view2) {
            setTimeout(function() {
              var ref2 = view2.state.selection;
              var $cursor = ref2.$cursor;
              if ($cursor) {
                run(view2, $cursor.pos, $cursor.pos, "", rules, plugin);
              }
            });
          }
        }
      },
      isInputRules: true
    });
    return plugin;
  }
  function run(view2, from4, to, text2, rules, plugin) {
    if (view2.composing) {
      return false;
    }
    var state2 = view2.state, $from = state2.doc.resolve(from4);
    if ($from.parent.type.spec.code) {
      return false;
    }
    var textBefore = $from.parent.textBetween(Math.max(0, $from.parentOffset - MAX_MATCH), $from.parentOffset, null, "\uFFFC") + text2;
    for (var i = 0; i < rules.length; i++) {
      var match = rules[i].match.exec(textBefore);
      var tr = match && rules[i].handler(state2, match, from4 - (match[0].length - text2.length), to);
      if (!tr) {
        continue;
      }
      view2.dispatch(tr.setMeta(plugin, {transform: tr, from: from4, to, text: text2}));
      return true;
    }
    return false;
  }
  var emDash = new InputRule(/--$/, "\u2014");
  var ellipsis = new InputRule(/\.\.\.$/, "\u2026");
  var openDoubleQuote = new InputRule(/(?:^|[\s\{\[\(\<'"\u2018\u201C])(")$/, "\u201C");
  var closeDoubleQuote = new InputRule(/"$/, "\u201D");
  var openSingleQuote = new InputRule(/(?:^|[\s\{\[\(\<'"\u2018\u201C])(')$/, "\u2018");
  var closeSingleQuote = new InputRule(/'$/, "\u2019");

  // src/schema.ts
  var nodes = {
    doc: {
      content: "block+"
    },
    paragraph: {
      content: "inline*",
      attrs: {type: {default: "base"}},
      group: "block",
      parseDOM: [{tag: "p", attrs: {type: "base"}}],
      toDOM() {
        return ["p", 0];
      }
    },
    text: {
      group: "inline"
    }
  };
  var getDelimContent = (delimiter) => (node4, schema2) => {
    if (node4.textContent?.startsWith(delimiter) && node4.textContent?.endsWith(delimiter)) {
      return Fragment.from(schema2.text(node4.textContent));
    } else {
      return Fragment.from(schema2.text(`${delimiter}${node4.textContent}${delimiter}`));
    }
  };
  var marks2 = {
    italic: {
      parseDOM: [
        {
          tag: "i",
          getContent: getDelimContent("_")
        },
        {
          tag: "em",
          getContent: getDelimContent("_")
        },
        {
          style: "font-style",
          getAttrs: (value) => value == "italic" && null,
          getContent: getDelimContent("_")
        }
      ],
      toDOM() {
        return ["em"];
      }
    },
    bold: {
      parseDOM: [
        {
          tag: "b",
          getContent: getDelimContent("*")
        },
        {
          tag: "strong",
          getContent: getDelimContent("*")
        },
        {
          style: "font-weight",
          getAttrs: (value) => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
          getContent: getDelimContent("*")
        }
      ],
      toDOM() {
        return ["strong"];
      }
    },
    code: {
      parseDOM: [
        {
          tag: "code",
          getContent: getDelimContent("`")
        }
      ],
      toDOM() {
        return ["code"];
      }
    }
  };
  var schema = new Schema({
    nodes,
    marks: marks2
  });

  // src/MarkdownPlugin.ts
  var bold = new InputRule(/\*([^\*.]+)\*$/, (state2, match, start3, end2) => {
    const tr = state2.tr;
    if (schema.marks.bold.isInSet(state2.doc.resolve(start3).marks())) {
      tr.insertText("*");
      return tr;
    } else {
      tr.insertText("*");
      tr.addMark(start3, end2 + 1, schema.marks.bold.create());
      tr.removeStoredMark(schema.marks.bold);
      return tr;
    }
  });
  var italic = new InputRule(/\_([^\_.]+)\_$/, (state2, _, start3, end2) => {
    const tr = state2.tr;
    if (schema.marks.italic.isInSet(state2.doc.resolve(start3).marks())) {
      tr.insertText("_");
      return tr;
    } else {
      tr.insertText("_");
      tr.addMark(start3, end2 + 1, schema.marks.italic.create());
      tr.removeStoredMark(schema.marks.italic);
      return tr;
    }
  });
  var code = new InputRule(/\`([^\`.]+)\`$/, (state2, _, start3, end2) => {
    const tr = state2.tr;
    if (schema.marks.code.isInSet(state2.doc.resolve(start3).marks())) {
      tr.insertText("`");
      return tr;
    } else {
      tr.insertText("`");
      tr.addMark(start3, end2 + 1, schema.marks.code.create());
      tr.removeStoredMark(schema.marks.code);
      return tr;
    }
  });
  var markdownKeyBindings = {};
  var MarkdownPlugin = inputRules({rules: [bold, italic, code]});

  // src/SaveStatePlugin.ts
  var SaveStatePlugin = new Plugin({
    view: (view2) => {
      const state2 = localStorage.getItem("gem-editor-state");
      if (state2) {
        const stateJSON = JSON.parse(state2);
        if (stateJSON) {
          const tr = view2.state.tr;
          const doc2 = Node.fromJSON(schema, stateJSON.doc);
          tr.replaceWith(0, tr.doc.content.size, doc2);
          view2.dispatch(tr);
        }
      }
      return {
        update(view3) {
          localStorage.setItem("gem-editor-state", JSON.stringify(view3.state.toJSON()));
        }
      };
    }
  });

  // src/SyntaxHighlightPlugin.ts
  var nodes2 = [
    {match: /^# (.*)$/g, class: "heading-1"},
    {match: /^## (.*)$/g, class: "heading-2"},
    {match: /^### (.*)$/g, class: "heading-3"},
    {match: /^---$/g, class: "divider"},
    {match: /^```$/g, class: "code-block"}
  ];
  var marks3 = [
    {match: /\*([^\*]*)\*/g, class: "bold"},
    {match: /\_([^\_]*)\_/g, class: "italic"},
    {match: /\`([^\`]*)\`/g, class: "code"}
  ];
  function highlightDocument(doc2) {
    const content2 = doc2.content;
    const highlights = [];
    content2.forEach((para, offset2) => {
      const content3 = para.textContent;
      for (const node4 of nodes2) {
        [...content3.matchAll(node4.match)].map((match) => {
          highlights.push(Decoration.node(offset2, offset2 + content3.length + 2, {
            class: node4.class
          }));
        });
      }
      for (const mark3 of marks3) {
        [...content3.matchAll(mark3.match)].map((match) => {
          const from4 = match.index + offset2;
          const to = match[0].length + from4 + 1;
          highlights.push(Decoration.inline(from4, to, {
            class: mark3.class
          }));
        });
      }
    });
    return highlights;
  }
  var SyntaxHighlightPlugin = new Plugin({
    state: {
      init(_, editorState) {
        return DecorationSet.create(editorState.doc, highlightDocument(editorState.doc));
      },
      apply(tr, highlights) {
        return DecorationSet.create(tr.doc, highlightDocument(tr.doc));
      }
    },
    props: {
      decorations(state2) {
        return SyntaxHighlightPlugin.getState(state2);
      }
    }
  });

  // src/index.ts
  var main = document.querySelector("main");
  var state = EditorState.create({
    doc: Node.fromJSON(schema, initalContent),
    schema,
    plugins: [
      history(),
      keymap({
        "Mod-z": undo,
        "Mod-y": redo,
        ...markdownKeyBindings
      }),
      keymap(baseKeymap),
      SyntaxHighlightPlugin,
      SaveStatePlugin,
      CursorPlugin
    ]
  });
  var view = new EditorView(main, {
    state
  });
  view.focus();
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL29yZGVyZWRtYXAvaW5kZXguZXMuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3Byb3NlbWlycm9yLW1vZGVsL3NyYy9kaWZmLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9wcm9zZW1pcnJvci1tb2RlbC9zcmMvZnJhZ21lbnQuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3Byb3NlbWlycm9yLW1vZGVsL3NyYy9jb21wYXJlZGVlcC5qcyIsICIuLi9ub2RlX21vZHVsZXMvcHJvc2VtaXJyb3ItbW9kZWwvc3JjL21hcmsuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3Byb3NlbWlycm9yLW1vZGVsL3NyYy9yZXBsYWNlLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9wcm9zZW1pcnJvci1tb2RlbC9zcmMvcmVzb2x2ZWRwb3MuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3Byb3NlbWlycm9yLW1vZGVsL3NyYy9ub2RlLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9wcm9zZW1pcnJvci1tb2RlbC9zcmMvY29udGVudC5qcyIsICIuLi9ub2RlX21vZHVsZXMvcHJvc2VtaXJyb3ItbW9kZWwvc3JjL3NjaGVtYS5qcyIsICIuLi9ub2RlX21vZHVsZXMvcHJvc2VtaXJyb3ItbW9kZWwvc3JjL2Zyb21fZG9tLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9wcm9zZW1pcnJvci1tb2RlbC9zcmMvdG9fZG9tLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9wcm9zZW1pcnJvci10cmFuc2Zvcm0vc3JjL21hcC5qcyIsICIuLi9ub2RlX21vZHVsZXMvcHJvc2VtaXJyb3ItdHJhbnNmb3JtL3NyYy90cmFuc2Zvcm0uanMiLCAiLi4vbm9kZV9tb2R1bGVzL3Byb3NlbWlycm9yLXRyYW5zZm9ybS9zcmMvc3RlcC5qcyIsICIuLi9ub2RlX21vZHVsZXMvcHJvc2VtaXJyb3ItdHJhbnNmb3JtL3NyYy9yZXBsYWNlX3N0ZXAuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3Byb3NlbWlycm9yLXRyYW5zZm9ybS9zcmMvc3RydWN0dXJlLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9wcm9zZW1pcnJvci10cmFuc2Zvcm0vc3JjL21hcmtfc3RlcC5qcyIsICIuLi9ub2RlX21vZHVsZXMvcHJvc2VtaXJyb3ItdHJhbnNmb3JtL3NyYy9tYXJrLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9wcm9zZW1pcnJvci10cmFuc2Zvcm0vc3JjL3JlcGxhY2UuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3Byb3NlbWlycm9yLXN0YXRlL3NyYy9zZWxlY3Rpb24uanMiLCAiLi4vbm9kZV9tb2R1bGVzL3Byb3NlbWlycm9yLXN0YXRlL3NyYy90cmFuc2FjdGlvbi5qcyIsICIuLi9ub2RlX21vZHVsZXMvcHJvc2VtaXJyb3Itc3RhdGUvc3JjL3N0YXRlLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9wcm9zZW1pcnJvci1zdGF0ZS9zcmMvcGx1Z2luLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9wcm9zZW1pcnJvci1jb21tYW5kcy9zcmMvY29tbWFuZHMuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3JvcGUtc2VxdWVuY2UvZGlzdC9pbmRleC5lcy5qcyIsICIuLi9ub2RlX21vZHVsZXMvcHJvc2VtaXJyb3ItaGlzdG9yeS9zcmMvaGlzdG9yeS5qcyIsICIuLi9ub2RlX21vZHVsZXMvdzNjLWtleW5hbWUvaW5kZXguZXMuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3Byb3NlbWlycm9yLWtleW1hcC9zcmMva2V5bWFwLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9wcm9zZW1pcnJvci12aWV3L3NyYy9icm93c2VyLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9wcm9zZW1pcnJvci12aWV3L3NyYy9kb20uanMiLCAiLi4vbm9kZV9tb2R1bGVzL3Byb3NlbWlycm9yLXZpZXcvc3JjL2RvbWNvb3Jkcy5qcyIsICIuLi9ub2RlX21vZHVsZXMvcHJvc2VtaXJyb3Itdmlldy9zcmMvdmlld2Rlc2MuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3Byb3NlbWlycm9yLXZpZXcvc3JjL3NlbGVjdGlvbi5qcyIsICIuLi9ub2RlX21vZHVsZXMvcHJvc2VtaXJyb3Itdmlldy9zcmMvY2FwdHVyZWtleXMuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3Byb3NlbWlycm9yLXZpZXcvc3JjL2RvbWNoYW5nZS5qcyIsICIuLi9ub2RlX21vZHVsZXMvcHJvc2VtaXJyb3Itdmlldy9zcmMvY2xpcGJvYXJkLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9wcm9zZW1pcnJvci12aWV3L3NyYy9kb21vYnNlcnZlci5qcyIsICIuLi9ub2RlX21vZHVsZXMvcHJvc2VtaXJyb3Itdmlldy9zcmMvaW5wdXQuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3Byb3NlbWlycm9yLXZpZXcvc3JjL2RlY29yYXRpb24uanMiLCAiLi4vbm9kZV9tb2R1bGVzL3Byb3NlbWlycm9yLXZpZXcvc3JjL2luZGV4LmpzIiwgIi4uL3NyYy9DdXJzb3JQbHVnaW4udHMiLCAiLi4vc3JjL2luaXRpYWwudHMiLCAiLi4vbm9kZV9tb2R1bGVzL3Byb3NlbWlycm9yLWlucHV0cnVsZXMvc3JjL2lucHV0cnVsZXMuanMiLCAiLi4vbm9kZV9tb2R1bGVzL3Byb3NlbWlycm9yLWlucHV0cnVsZXMvc3JjL3J1bGVzLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9wcm9zZW1pcnJvci1pbnB1dHJ1bGVzL3NyYy9ydWxlYnVpbGRlcnMuanMiLCAiLi4vc3JjL3NjaGVtYS50cyIsICIuLi9zcmMvTWFya2Rvd25QbHVnaW4udHMiLCAiLi4vc3JjL1NhdmVTdGF0ZVBsdWdpbi50cyIsICIuLi9zcmMvU3ludGF4SGlnaGxpZ2h0UGx1Z2luLnRzIiwgIi4uL3NyYy9pbmRleC50cyJdLAogICJtYXBwaW5ncyI6ICI7O0FBRUEsc0JBQW9CLFVBQVM7QUFDM0IsU0FBSyxVQUFVO0FBQUE7QUFHakIsYUFBVyxZQUFZO0FBQUEsSUFDckIsYUFBYTtBQUFBLElBRWIsTUFBTSxTQUFTLEtBQUs7QUFDbEIsZUFBUyxJQUFJLEdBQUcsSUFBSSxLQUFLLFFBQVEsUUFBUSxLQUFLO0FB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
