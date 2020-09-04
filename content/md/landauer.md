# The cost of a bit (or the thermodynamics of computing)

A few months ago I had to evaluate the cooling requirements for the data center at my office (electricity-bill wise, you know) and wondered how much of an IT device's power consumption turns into heat that needs to be removed by air conditioning. I asked my very-dear and very-long-time friend Juan Luis, who's been designing cooling systems for decades, and he answered: it's assumed that the whole of an IT device's power consumption is emitted as heat. Really straightforward, that solves the problem, thank you so much!

But wait. 

When someone's happened to study [thermodynamics](https://en.wikipedia.org/wiki/Thermodynamics) at any point in their life a few concepts stuck forever:

1. Nothing comes for free, everything has an energy cost.

2. Energy won't just disappear. Energy fed into "something" will be kept inside or emitted, maybe as a different kind of energy.

3. When that energy is used to make that "something" do some task, you always get less utility output than energy input, which leads to the concept of _efficiency_. In the early stages of thermodynamics, that "something" was a thermal engine (a [steam engine](https://en.wikipedia.org/wiki/Steam_engine), particularly) and its utility was mechanical work; the difference between energy input (burning coal) and the work output, as determined by the engine's _thermal efficiency_, was just delivered as waste heat to the environment. 

The development of thermodynamics was originally aimed precisely at improving the thermal efficiency of steam engines, but the mind blowing matter about it is that it turned to be universally applicable to any process involving energy (i.e. any process). And the universal consequences of that stated in the paragraph above are: i. nothing has 100% efficiency, there's always a waste (* ); and ii. that waste will ultimately and irreversibly be delivered as heat (**). 

Irreversibility is precisely the key concept for our discussion. Once heat is wasted, the process is irreversible; reciprocally, any irreversible process will waste heat. Don't want to dig deeper into that: it's out of the scope of this article and well beyond my knowledge of thermodynamics. Just keep the idea in mind.

So I had to make the following objection to Juan Luis' rule of thumb: if all of a computer's power input is delivered as heat (i.e. 0% efficiency), where's the utility of the information processed by that computer? Dunno about that -he said-; but taking it all as waste heat accounts for a nice margin of safety in the design of the cooling system, which is -you know- peace of mind for an engineer.

All right. Duly noted and put aside.

But only until a few weeks ago, when I got, just out of curiosity, this book on Steganography: [Disappearing Cryptography](https://dl.acm.org/doi/book/10.5555/1523275), by Peter Weiner. It's a really nice book on a really interesting matter well worth to be discussed maybe in a later article. But it's brought here today because it provided, as a side note, a good lead about the thermodynamic cost of computing: the so-called [Landauer's Principle](https://en.wikipedia.org/wiki/Landauer%27s_principle).

I think I got the idea and I'll try to explain it, although I risk incurring in gross physical inaccuracies. Thermodynamic analysis can be very nuanced and it's very prone to mental pitfalls. But let's try:

A bit processed by a computer has (or can have) an utility as long as it's _in use_, i.e. _referenced_ by a program running in it. Suppose a bit shows whether there's someone standing at your door; a program could check that bit and ring a bell to warn you. As long as that program is running and checking the bit, information (and thus utility), can be extracted from it; when the bit is _dereferenced_ (i.e. not watched by any program any more), it ceases to yield any utility. Landauer proposed that the thermodynamic cost of processing a bit is incurred, precisely, at that moment. 

The processes of setting and checking a bit _electronically_ for sure have a cost (you just have to check your electricity bill), but in terms of purely abstract thinking they needn't. There's no inherent energy consumption involved in the pure logic of true or false, so bit operations could in theory be done at zero cost; also, flipping a bit from 0 to 1 or vice versa is a reversible process. It's when a bit is discarded, or dereferenced, when irreversibility kicks in, as that information is lost forever, and therefore there must be some heat waste inherent to it. Landauer set that waste at a theoretical minimum value of 2.805 zJ (that's 2.805 * 10^-21 J) at room temperature. So, have in mind that anytime you happen to allocate a bit you'll eventually end up dumping _at least_ that amount of heat to the Universe.

In practice you're dumping more; a lot more, indeed. Remember thermal efficiency? The fact that there's a minimum cost for a process doesn't prevent it being done at a higher cost. You can commute to your office on a 1960 fuel-hogging Cadillac or a 2020 electric ZOE, e.g.; the utility is mostly the same, but the cost (and thus efficiency) differs hugely. In a similar fashion, computing a bit can be done more or less efficiently. In practice, the cost was around millions of times Landauer's minimum in computers of the 2000's and it's in the thousands nowadays. The energy efficiency of computing is really bad, you can tell, but it's improving quickly (more on this later).

But what about the utility? There's usually a certain (sometimes a huge) utility in computing, so it must appear as energy somewhere. Well, within a thermodynamics frame of reasoning the flow of energy can be subtly misleading: sometimes utility appears far, and apparently unrelated, to the process; but in the grand scheme of things there's always utility and waste exactly balanced with input energy. Think for instance of a fridge: if you look only at its inside, it produces cold; it's when you look at the whole of it when you realize that a fridge in fact delivers more heat (to the outside) than cold (to the inside); the difference is the waste related to the less-than-100% efficiency of the cooling process. Getting back to the example of the bit-activated door ring, having a computer watching your door saves you the effort of having to do it yourself; thus, although the power is consumed by the computer, the utility is seized by you. Considering the whole system (the computer and you) the thermal balance *will* add up. Certified by thermodynamics.

So, to sum up, Juan Luis was right (he usually is): every watt of electric power taken by a computer will end up as waste heat. Utility goes somewhere else, usually outside the data center; but somewhere within our Universe, anyhow, so it's globally balanced.

A final word (and a cliffhanger). As said before, the energy efficiency of computing is improving at a fast pace, and [it's expected to reach Landauer's bound by 2050](https://en.wikipedia.org/wiki/Koomey%27s_law). From then on, thermodynamics will prevent computers from processing more bits per unit of energy. But remember that the energy cost of a bit is only "accounted for" when the bit is discarded; what if computers and algorithms are designed in a way that no bits are ever disposed of? With irreversibility out of the scene, the power consumption of computing could eventually (although theoretically) drop to zero. That model is called [reversible computing](https://en.wikipedia.org/wiki/Reversible_computing), and it's a fascinating one. Stuff for a later article, maybe.

Notes: 

(*) The typical efficiency of some common devices we use on a daily basis can be quite eye-opening about our world: gas car engine: 20-30%; diesel car engine: 30-40%; incandescent light bulb: 10%; LED lamp: 40-50%. Mind what you're doing when you switch on.

(**) Which has an even deeper consequence, namely the [heat death of the Universe](https://en.wikipedia.org/wiki/Heat_death_of_the_universe). Didn't I say that thermodynamics is mind blowing stuff?
