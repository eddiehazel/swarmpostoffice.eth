import Component from '@glimmer/component';

export default class StorageCostGrid extends Component {
  getSizeForDepth(depth) {
    // Define the storage options array.
    // It's a good practice to define constants outside the function if they are static
    // to avoid re-creating the array on every call, but for a standalone fix,
    // defining it inside is acceptable.
    const ALL_STORAGE_OPTIONS = [
      { depth: 19, size: '110MB' },
      { depth: 20, size: '680MB' },
      { depth: 21, size: '2.6GB' },
      { depth: 22, size: '7.7GB' },
      { depth: 23, size: '20GB' },
      { depth: 24, size: '47GB' },
      { depth: 25, size: '105GB' },
      { depth: 26, size: '227GB' },
      { depth: 27, size: '476GB' },
    ];

    // Use Array.prototype.find() to search for the matching object.
    const matchingOption = ALL_STORAGE_OPTIONS.find(
      (option) => option.depth === depth
    );

    // Check if an option was found.
    if (matchingOption) {
      // Return the 'size' property of the matching object.
      return matchingOption.size;
    }

    // Handle the case where the depth is not found (optional, but recommended).
    return null; // or throw an error, or return a default value like 'Unknown'
  }

  getChunksForDepth(depth) {
    return Math.pow(2, depth);
  }

  getSizeInGB(depth) {
    const sizeStr = this.getSizeForDepth(depth);
    const match = sizeStr.match(/^([\d.]+)(MB|GB)$/);
    if (!match) return 0;

    const value = parseFloat(match[1]);
    const unit = match[2];

    if (unit === 'GB') {
      return value;
    } else {
      return value / 1024; // MB to GB
    }
  }

  calculateBzzPerGBPerMonth(pricePerChunk, depth) {
    // Calculation breakdown:
    // 1. pricePerChunk is in PLUR
    // 2. Get the size in GB for this depth
    // 3. Calculate chunks for this depth
    // 4. Total cost for this depth = chunks * pricePerChunk (in BZZ)
    // 5. Cost per GB = total cost / size in GB
    // 6. For a month, we assume this is a monthly storage cost

    // ; (151563651357081600/1e16)/2.6
    // 	5.8293712060416
    // ; 3.536*4
    // 	14.144
    // ; (3.536*4)/2.6
    // 	5.44

    const BLOCK_TIME_SECONDS = 5;

    const sizeInGB = this.getSizeInGB(depth);
    console.log('sizeInGB', sizeInGB);
    //2.2

    if (sizeInGB === 0) return 0;

    const chunks = this.getChunksForDepth(depth);
    const actualSizeInGB = (chunks * 1024 * 4) / 1024 / 1000 / 1000;
    console.log('actualSizeInGB', actualSizeInGB);
    // 134.217728

    // Total cost in BZZ to store this amount as will be calculated by the storage incentives contract
    // based on the total number of chunks and current price
    // then multiplied up to get price for one month

    console.log(pricePerChunk, chunks);
    const totalCost = pricePerChunk * chunks;

    const costPerMonth = ((totalCost * 60) / BLOCK_TIME_SECONDS) * 60 * 24 * 30;

    // Normalise cost per GB for this depth
    const costPerGBMOnth = costPerMonth / sizeInGB;

    // console.log("depth", depth, "totalCost", totalCost, "sizeInGB", sizeInGB)

    // console.log("pricePerChunk, totalCost, costPerGB", pricePerChunk, totalCost, costPerGBMOnth)

    return costPerGBMOnth / 1e16;
  }

  get storageOptions() {
    console.log('[StorageCost] Input latestPrice:', this.args.latestPrice);

    if (!this.args.latestPrice) {
      console.warn('[StorageCost] No latestPrice provided!');
      return [
        { label: 'Small', value: '-', size: '68MB' },
        { label: 'Medium', value: '-', size: '2.2GB' },
        { label: 'Large', value: '-', size: '70.3GB' },
      ];
    }

    const priceInPLUR = this.args.latestPrice;

    console.log('[StorageCost] Price conversion:', {
      latestPrice: this.args.latestPrice,
      priceInPLUR,
    });

    // Small = depth 20 (68MB)
    // Medium = depth 24 (2.2GB)
    // Large = depth 30 (70.3GB)

    const small_depth = 19;
    const medium_depth = 23;
    const large_depth = 27;

    const small = this.calculateBzzPerGBPerMonth(priceInPLUR, small_depth);
    const medium = this.calculateBzzPerGBPerMonth(priceInPLUR, medium_depth);
    const large = this.calculateBzzPerGBPerMonth(priceInPLUR, large_depth);

    console.log(small, medium, large);

    return [
      {
        label: 'Small',
        value: small.toFixed(1),
        size: this.getSizeForDepth(small_depth),
      },
      {
        label: 'Medium',
        value: medium.toFixed(1),
        size: this.getSizeForDepth(medium_depth),
      },
      {
        label: 'Large',
        value: large.toFixed(1),
        size: this.getSizeForDepth(large_depth),
      },
    ];
  }

  <template>
    <div class="stat-card storage-cost-grid">
      <div class="stat-label">💾
        <a
          href="https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=0x19062190B1925b5b6689D7073fDfC8c2976EF8Cb"
          target="_blank"
          rel="noopener noreferrer"
        >BZZ</a>/GB-MONTH</div>
      <div class="storage-grid">
        {{#each this.storageOptions as |option|}}
          <div class="storage-item">
            <div class="storage-value">{{option.value}}</div>
            <div class="storage-label">{{option.label}} ({{option.size}})</div>
          </div>
        {{/each}}
      </div>
    </div>
  </template>
}
