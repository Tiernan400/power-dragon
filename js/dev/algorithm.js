const algorithm = {
    weights: [],
    closest: {
        balance: Number.POSITIVE_INFINITY,
        diff: Number.POSITIVE_INFINITY
    },
    autres: [],
    freeWeights: [],
    fixedLeft: [],
    fixedRight: [],
    countBalance: (left, right) => {
        lTotal = 0;
        rTotal = 0;
        for (let i = 0; i < left.length; i++) {
            lTotal += left[i].w;
        }
        for (let i = 0; i < right.length; i++) {
            rTotal += right[i].w;
        }
        b = lTotal - rTotal;
        return [b, [lTotal, rTotal]]
    },
    newSplit: (c, a, l = [], r = []) => {
        for (let i = 0; i < c.length; i++) {
            l.push(a[c[i]])
        }
        for (let i = 0; i < a.length; i++) {
            if (!c.includes(i)) r.push(a[i])
        }
        return [l, r]
    },
    backSplit: (c, a, l = [], r = []) => {
        for (let i = 0; i < c.length; i++) {
            r.push(a[c[i]])
        }
        for (let i = 0; i < a.length; i++) {
            if (!c.includes(i)) l.push(a[i])
        }
        return [l, r]
    },
    c: (c, max, num) => {
        if (c.length < 2) return false;
        if (c[num] == max) {
            if (num != 1) {
                c = algorithm.c(c, max - 1, num - 1)
                c[num] = c[num - 1] + 1;
            } else {
                return false;
            }
        } else {
            c[num] += 1;
        }
        return c;
    },
    splitArray: (array, leftCertain, rightCertain, fullArray) => {
        var l = fullArray.length / 2;
        var ll = l - leftCertain, rl = l + rightCertain;
        var c = [], incomplete = true;
        for (let i = 0; i < ll; i++) {
            c.push(i)
        }
        while (incomplete) {
            s = algorithm.newSplit(c, array)
            s2 = algorithm.backSplit(c, array)
            l1 = [...s[0], ...algorithm.fixedLeft]
            r1 = [...s[1], ...algorithm.fixedRight]
            l2 = [...s2[0], ...algorithm.fixedLeft]
            r2 = [...s2[1], ...algorithm.fixedRight]
            count = algorithm.countBalance(l1, r1)
            count2 = algorithm.countBalance(l2, r2)
            diff = count[0]
            if (diff < 0) diff = diff * -1;
            if (diff < algorithm.closest.diff) {
                algorithm.closest = {
                    balance: count[0],
                    diff: diff,
                    totals: count[1],
                    left: l1,
                    right: r1,
                    leftPercent: count[1][0] / ( count[1][0] + count[1][1] ) * 100,
                    rightPercent: count[1][1] / ( count[1][0] + count[1][1] ) * 100
                }
            } else if (diff == algorithm.closest.diff) {
                algorithm.autres.push({
                    balance: count[0],
                    diff: diff,
                    totals: count[1],
                    left: l1,
                    right: r1,
                    leftPercent: count[1][0] / ( count[1][0] + count[1][1] ) * 100,
                    rightPercent: count[1][1] / ( count[1][0] + count[1][1] ) * 100
                })
            }
            diff2 = count2[0]
            if (diff2 < 0) diff2 = diff2 * -1;
            if (diff2 < algorithm.closest.diff) {
                algorithm.closest = {
                    balance: count2[0],
                    diff: diff2,
                    totals: count2[1],
                    left: l2,
                    right: r2,
                    leftPercent: count2[1][0] / ( count2[1][0] + count2[1][1] ) * 100,
                    rightPercent: count2[1][1] / ( count2[1][0] + count2[1][1] ) * 100
                }
            } else if (diff2 == algorithm.closest.diff) {
                algorithm.autres.push({
                    balance: count2[0],
                    diff: diff2,
                    totals: count2[1],
                    left: l2,
                    right: r2,
                    leftPercent: count2[1][0] / ( count2[1][0] + count2[1][1] ) * 100,
                    rightPercent: count2[1][1] / ( count2[1][0] + count2[1][1] ) * 100
                })
            }
            c = algorithm.c(c, array.length - 1, c.length - 1);
            if (!c) incomplete = false;
        }
    },
    balance: (weights, seats = 10) => {
        if (weights) algorithm.weights = weights;
        algorithm.closest = {
            balance: Number.POSITIVE_INFINITY,
            diff: Number.POSITIVE_INFINITY
        }
        algorithm.autres = []
        algorithm.freeWeights = []
        algorithm.fixedLeft = []
        algorithm.fixedRight = []
        var ws = algorithm.weights;
        for (let i = 0; i < ws.length; i++) {
            if (!ws[i].active) continue;
            if (ws[i].side == "left") {
                algorithm.fixedLeft.push({n: ws[i].name, w: parseInt(ws[i].weight, 10)})
            } else if (ws[i].side == "right") {
                algorithm.fixedRight.push({n: ws[i].name, w: parseInt(ws[i].weight, 10)})
            } else if (ws[i].side == "any") {
                algorithm.freeWeights.push({n: ws[i].name, w: parseInt(ws[i].weight, 10)})
            }
        }
        wLength = [...algorithm.fixedLeft, ...algorithm.fixedRight, ...algorithm.freeWeights].length;
        if (wLength % 2 == 1) return 'odd';
        else if (wLength > seats * 2) return 'seats';
        else if (
            ( algorithm.fixedLeft.length > algorithm.fixedRight.length + algorithm.freeWeights.length )
            || ( algorithm.fixedRight.length > algorithm.fixedLeft.length + algorithm.freeWeights.length )
        ) return 'picky';
        algorithm.splitArray(
            algorithm.freeWeights,
            algorithm.fixedLeft.length,
            algorithm.fixedRight.length,
            [...algorithm.fixedLeft, ...algorithm.fixedRight, ...algorithm.freeWeights]
        );
        bestDifference = algorithm.closest.diff;
        newAutres = []
        for (let i = 0; i < algorithm.autres.length; i++) {
            if (algorithm.autres[i].diff == bestDifference) newAutres.push(algorithm.autres[i])
        }
        algorithm.autres = newAutres;
        return { closest: algorithm.closest, alternatives: algorithm.autres }
    }
}